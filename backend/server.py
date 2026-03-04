from fastapi import FastAPI, APIRouter, Query, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
import sys
sys.path.insert(0, str(ROOT_DIR))
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============ PYDANTIC MODELS ============

class UserCreate(BaseModel):
    nome: str
    avatar_id: str = "hacker"

class UserUpdate(BaseModel):
    nome: Optional[str] = None
    avatar_id: Optional[str] = None

class XPAdd(BaseModel):
    xp: int
    source: str = "quiz"

class CoinsAdd(BaseModel):
    coins: int
    source: str = "quiz"

class QuizStartRequest(BaseModel):
    user_id: str
    language: str
    question_type: str = "mcq"
    difficulty: Optional[int] = None
    count: int = 10

class AnswerSubmit(BaseModel):
    user_id: str
    question_id: str
    answer: str

class MissionComplete(BaseModel):
    user_id: str
    mission_id: str

class ShopBuy(BaseModel):
    user_id: str
    item_id: str

class PairValidate(BaseModel):
    user_id: str
    challenge_id: str
    code: str

# ============ HELPER FUNCTIONS ============

def xp_for_level(level: int) -> int:
    return int(100 * (1.15 ** (level - 1)))

def get_title(level: int) -> str:
    if level <= 10: return "Júnior"
    if level <= 20: return "Pleno"
    if level <= 30: return "Sênior"
    return "Arquiteto"

async def add_xp_to_user(user_id: str, xp_amount: int):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return None
    new_xp = user.get("xp", 0) + xp_amount
    nivel = user.get("nivel", 1)
    xp_needed = xp_for_level(nivel)
    leveled_up = False
    while new_xp >= xp_needed:
        new_xp -= xp_needed
        nivel += 1
        xp_needed = xp_for_level(nivel)
        leveled_up = True
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"xp": new_xp, "nivel": nivel, "titulo": get_title(nivel), "xp_proximo_nivel": xp_needed}}
    )
    return {"nivel": nivel, "xp": new_xp, "xp_proximo_nivel": xp_needed, "leveled_up": leveled_up}

async def add_coins_to_user(user_id: str, coins: int):
    await db.users.update_one({"id": user_id}, {"$inc": {"codecoins": coins}})

# ============ USER ENDPOINTS ============

@api_router.post("/user")
async def create_user(data: UserCreate):
    user_id = str(uuid.uuid4())[:12]
    now = datetime.now(timezone.utc).isoformat()
    user = {
        "id": user_id,
        "nome": data.nome,
        "avatar_id": data.avatar_id,
        "nivel": 1,
        "xp": 0,
        "xp_proximo_nivel": 100,
        "codecoins": 100,
        "streak_dias": 0,
        "ultimo_acesso": now,
        "data_criacao": now,
        "titulo": "Code Apprentice",
        "linguagens_desbloqueadas": ["csharp"],
        "skins_desbloqueadas": ["hacker"],
        "badges": [],
        "total_quizzes": 0,
        "total_acertos": 0,
        "total_missoes": 0,
        "total_bugs_encontrados": 0,
        "quiz_stats": {
            "csharp": {"total": 0, "acertos": 0, "fraquezas": []},
            "sql": {"total": 0, "acertos": 0, "fraquezas": []},
            "python": {"total": 0, "acertos": 0, "fraquezas": []},
            "java": {"total": 0, "acertos": 0, "fraquezas": []}
        }
    }
    await db.users.insert_one(user)
    user.pop("_id", None)
    return user

@api_router.get("/user/{user_id}")
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(404, "Usuário não encontrado")
    now = datetime.now(timezone.utc)
    ultimo = user.get("ultimo_acesso", "")
    if ultimo:
        try:
            last_dt = datetime.fromisoformat(ultimo)
            diff_days = (now - last_dt).days
            if diff_days >= 2:
                user["streak_dias"] = 0
            elif diff_days == 1:
                user["streak_dias"] = user.get("streak_dias", 0) + 1
            await db.users.update_one(
                {"id": user_id},
                {"$set": {"streak_dias": user["streak_dias"], "ultimo_acesso": now.isoformat()}}
            )
        except Exception:
            pass
    return user

@api_router.put("/user/{user_id}")
async def update_user(user_id: str, data: UserUpdate):
    updates = {k: v for k, v in data.dict().items() if v is not None}
    if not updates:
        raise HTTPException(400, "Nada para atualizar")
    await db.users.update_one({"id": user_id}, {"$set": updates})
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    return user

@api_router.post("/user/{user_id}/add-xp")
async def add_xp(user_id: str, data: XPAdd):
    result = await add_xp_to_user(user_id, data.xp)
    if not result:
        raise HTTPException(404, "Usuário não encontrado")
    return result

@api_router.post("/user/{user_id}/add-coins")
async def add_coins(user_id: str, data: CoinsAdd):
    await add_coins_to_user(user_id, data.coins)
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    return {"codecoins": user.get("codecoins", 0)}

@api_router.post("/user/{user_id}/unlock-language")
async def unlock_language(user_id: str, language: str = Query(...)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(404, "Usuário não encontrado")
    langs = user.get("linguagens_desbloqueadas", [])
    if language not in langs:
        langs.append(language)
        await db.users.update_one({"id": user_id}, {"$set": {"linguagens_desbloqueadas": langs}})
    return {"linguagens_desbloqueadas": langs}

@api_router.post("/user/{user_id}/unlock-skin")
async def unlock_skin(user_id: str, skin: str = Query(...)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(404, "Usuário não encontrado")
    skins = user.get("skins_desbloqueadas", [])
    if skin not in skins:
        skins.append(skin)
        await db.users.update_one({"id": user_id}, {"$set": {"skins_desbloqueadas": skins}})
    return {"skins_desbloqueadas": skins}

# ============ QUESTIONS ENDPOINTS ============

@api_router.get("/questions")
async def get_questions(
    language: Optional[str] = None,
    category: Optional[str] = None,
    question_type: Optional[str] = None,
    difficulty: Optional[int] = None,
    limit: int = 20,
    skip: int = 0
):
    query = {}
    if language: query["language"] = language
    if category: query["category"] = category
    if question_type: query["type"] = question_type
    if difficulty: query["difficulty"] = difficulty
    questions = await db.questions.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    return questions

@api_router.get("/questions/random")
async def get_random_questions(
    language: str = Query(...),
    count: int = 10,
    question_type: Optional[str] = None,
    difficulty: Optional[int] = None
):
    match = {"language": language}
    if question_type: match["type"] = question_type
    if difficulty: match["difficulty"] = difficulty
    pipeline = [{"$match": match}, {"$sample": {"size": count}}, {"$project": {"_id": 0}}]
    questions = await db.questions.aggregate(pipeline).to_list(count)
    return questions

@api_router.get("/questions/count")
async def get_question_counts():
    pipeline = [
        {"$group": {"_id": {"language": "$language", "type": "$type"}, "count": {"$sum": 1}}},
        {"$sort": {"_id.language": 1}}
    ]
    results = await db.questions.aggregate(pipeline).to_list(100)
    counts = {}
    total = 0
    for r in results:
        lang = r["_id"]["language"]
        qtype = r["_id"]["type"]
        if lang not in counts:
            counts[lang] = {"total": 0}
        counts[lang][qtype] = r["count"]
        counts[lang]["total"] += r["count"]
        total += r["count"]
    return {"total": total, "by_language": counts}

@api_router.get("/questions/categories")
async def get_categories(language: str = Query(...)):
    pipeline = [
        {"$match": {"language": language}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    results = await db.questions.aggregate(pipeline).to_list(100)
    return [{"category": r["_id"], "count": r["count"]} for r in results]

# ============ QUIZ ENDPOINTS ============

@api_router.post("/quiz/start")
async def start_quiz(data: QuizStartRequest):
    match = {"language": data.language}
    if data.question_type != "mixed":
        match["type"] = data.question_type
    if data.difficulty:
        match["difficulty"] = data.difficulty
    pipeline = [{"$match": match}, {"$sample": {"size": data.count}}, {"$project": {"_id": 0}}]
    questions = await db.questions.aggregate(pipeline).to_list(data.count)
    if not questions:
        raise HTTPException(404, "Nenhuma questão encontrada")
    session_id = str(uuid.uuid4())[:12]
    session = {
        "id": session_id,
        "user_id": data.user_id,
        "language": data.language,
        "question_ids": [q["id"] for q in questions],
        "total": len(questions),
        "answered": 0,
        "correct": 0,
        "xp_earned": 0,
        "coins_earned": 0,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "completed": False
    }
    await db.quiz_sessions.insert_one(session)
    session.pop("_id", None)
    safe_questions = []
    for q in questions:
        sq = {k: v for k, v in q.items() if k not in ["correct_answer", "explanation"]}
        safe_questions.append(sq)
    return {"session": session, "questions": safe_questions}

@api_router.post("/quiz/answer")
async def submit_answer(data: AnswerSubmit):
    question = await db.questions.find_one({"id": data.question_id}, {"_id": 0})
    if not question:
        raise HTTPException(404, "Questão não encontrada")
    is_correct = str(data.answer).strip().lower() == str(question["correct_answer"]).strip().lower()
    xp = question.get("xp_reward", 10) if is_correct else 0
    coins = question.get("coins_reward", 5) if is_correct else 0
    if is_correct:
        await add_xp_to_user(data.user_id, xp)
        await add_coins_to_user(data.user_id, coins)
        await db.users.update_one({"id": data.user_id}, {"$inc": {"total_acertos": 1}})
        stat_path = f"quiz_stats.{question['language']}.acertos"
        await db.users.update_one({"id": data.user_id}, {"$inc": {stat_path: 1}})
    stat_total_path = f"quiz_stats.{question['language']}.total"
    await db.users.update_one({"id": data.user_id}, {"$inc": {"total_quizzes": 1, stat_total_path: 1}})
    return {
        "correct": is_correct,
        "correct_answer": question["correct_answer"],
        "explanation": question.get("explanation", ""),
        "xp_earned": xp,
        "coins_earned": coins
    }

@api_router.get("/quiz/history/{user_id}")
async def quiz_history(user_id: str, limit: int = 20):
    sessions = await db.quiz_sessions.find(
        {"user_id": user_id}, {"_id": 0}
    ).sort("started_at", -1).limit(limit).to_list(limit)
    return sessions

# ============ MISSIONS ENDPOINTS ============

@api_router.get("/missions/daily/{user_id}")
async def get_daily_missions(user_id: str):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    missions = await db.missions.find({"user_id": user_id, "date": today}, {"_id": 0}).to_list(10)
    if not missions:
        daily_templates = [
            {"type": "quiz", "title": "Quiz Diário", "description": "Complete 5 quizzes de qualquer linguagem", "target": 5, "xp_reward": 50, "coins_reward": 25, "icon": "brain"},
            {"type": "streak", "title": "Manter Streak", "description": "Faça login e estude hoje", "target": 1, "xp_reward": 30, "coins_reward": 15, "icon": "flame"},
            {"type": "code_complete", "title": "Completar Código", "description": "Resolva 3 desafios de completar código", "target": 3, "xp_reward": 40, "coins_reward": 20, "icon": "code"},
            {"type": "bug_hunt", "title": "Caçador de Bugs", "description": "Encontre 2 bugs em código", "target": 2, "xp_reward": 35, "coins_reward": 18, "icon": "bug"},
            {"type": "pair", "title": "Pair Programming", "description": "Complete 1 desafio de pair programming", "target": 1, "xp_reward": 45, "coins_reward": 22, "icon": "users"},
        ]
        selected = random.sample(daily_templates, min(3, len(daily_templates)))
        missions = []
        for t in selected:
            m = {
                "id": str(uuid.uuid4())[:12],
                "user_id": user_id,
                "date": today,
                "type": t["type"],
                "title": t["title"],
                "description": t["description"],
                "target": t["target"],
                "progress": 0,
                "completed": False,
                "xp_reward": t["xp_reward"],
                "coins_reward": t["coins_reward"],
                "icon": t["icon"],
                "claimed": False
            }
            missions.append(m)
        await db.missions.insert_many([dict(m) for m in missions])
        for m in missions:
            m.pop("_id", None)
    return missions

@api_router.get("/missions/weekly/{user_id}")
async def get_weekly_missions(user_id: str):
    now = datetime.now(timezone.utc)
    week_start = (now - timedelta(days=now.weekday())).strftime("%Y-%m-%d")
    missions = await db.missions.find({"user_id": user_id, "date": week_start, "weekly": True}, {"_id": 0}).to_list(10)
    if not missions:
        weekly_templates = [
            {"title": "CRUD WinForms C#", "description": "Complete o projeto de CRUD com WinForms e SQLite", "target": 6, "xp_reward": 200, "coins_reward": 100, "language": "csharp"},
            {"title": "API .NET 8 Minimal", "description": "Construa uma API REST com .NET 8 e EF Core", "target": 5, "xp_reward": 250, "coins_reward": 120, "language": "csharp"},
            {"title": "Python CLI Automação", "description": "Crie scripts Python para automação de tarefas", "target": 4, "xp_reward": 180, "coins_reward": 90, "language": "python"},
            {"title": "SQL Master Query", "description": "Resolva 20 queries SQL complexas", "target": 20, "xp_reward": 300, "coins_reward": 150, "language": "sql"},
        ]
        selected = random.sample(weekly_templates, min(2, len(weekly_templates)))
        missions = []
        for t in selected:
            m = {
                "id": str(uuid.uuid4())[:12],
                "user_id": user_id,
                "date": week_start,
                "weekly": True,
                "type": "project",
                "title": t["title"],
                "description": t["description"],
                "target": t["target"],
                "progress": 0,
                "completed": False,
                "xp_reward": t["xp_reward"],
                "coins_reward": t["coins_reward"],
                "language": t.get("language", ""),
                "claimed": False
            }
            missions.append(m)
        await db.missions.insert_many([dict(m) for m in missions])
        for m in missions:
            m.pop("_id", None)
    return missions

@api_router.get("/missions/boss")
async def get_boss_missions():
    bosses = [
        {"id": "boss_sql_warlord", "title": "SQL Warlord", "description": "10 questões SQL perfeitas seguidas", "language": "sql", "difficulty": 5, "questions_count": 10, "xp_reward": 500, "coins_reward": 250, "badge": "SQL Warlord"},
        {"id": "boss_csharp_dragon", "title": "C# Dragon", "description": "Derrote o dragão resolvendo 10 desafios C# difíceis", "language": "csharp", "difficulty": 5, "questions_count": 10, "xp_reward": 500, "coins_reward": 250, "badge": "C# Dragon Slayer"},
        {"id": "boss_python_serpent", "title": "Python Serpent", "description": "Enfrente a serpente com 10 desafios Python avançados", "language": "python", "difficulty": 5, "questions_count": 10, "xp_reward": 500, "coins_reward": 250, "badge": "Python Master"},
        {"id": "boss_java_shogun", "title": "Java Shogun", "description": "Desafie o Shogun com 10 questões Java expert", "language": "java", "difficulty": 5, "questions_count": 10, "xp_reward": 500, "coins_reward": 250, "badge": "Java Shogun"},
    ]
    return bosses

@api_router.post("/missions/complete")
async def complete_mission(data: MissionComplete):
    mission = await db.missions.find_one({"id": data.mission_id, "user_id": data.user_id}, {"_id": 0})
    if not mission:
        raise HTTPException(404, "Missão não encontrada")
    if mission.get("claimed"):
        return {"message": "Recompensa já coletada", "mission": mission}
    await db.missions.update_one(
        {"id": data.mission_id},
        {"$set": {"completed": True, "claimed": True}}
    )
    await add_xp_to_user(data.user_id, mission.get("xp_reward", 0))
    await add_coins_to_user(data.user_id, mission.get("coins_reward", 0))
    await db.users.update_one({"id": data.user_id}, {"$inc": {"total_missoes": 1}})
    return {"message": "Missão completada!", "xp": mission.get("xp_reward", 0), "coins": mission.get("coins_reward", 0)}

@api_router.post("/missions/{mission_id}/progress")
async def update_mission_progress(mission_id: str, user_id: str = Query(...)):
    mission = await db.missions.find_one({"id": mission_id, "user_id": user_id}, {"_id": 0})
    if not mission:
        raise HTTPException(404, "Missão não encontrada")
    new_progress = min(mission.get("progress", 0) + 1, mission.get("target", 1))
    completed = new_progress >= mission.get("target", 1)
    await db.missions.update_one(
        {"id": mission_id},
        {"$set": {"progress": new_progress, "completed": completed}}
    )
    return {"progress": new_progress, "target": mission.get("target", 1), "completed": completed}

# ============ SHOP ENDPOINTS ============

@api_router.get("/shop/items")
async def get_shop_items():
    items = await db.shop_items.find({}, {"_id": 0}).to_list(100)
    if not items:
        default_items = [
            {"id": "hint_1", "name": "Dica Básica", "description": "Revela a próxima linha de código", "price": 10, "type": "consumable", "icon": "lightbulb", "category": "hints"},
            {"id": "hint_3", "name": "Pacote 3 Dicas", "description": "3 dicas para usar quando precisar", "price": 25, "type": "consumable", "icon": "lightbulb", "category": "hints"},
            {"id": "hint_10", "name": "Mega Pack Dicas", "description": "10 dicas com desconto", "price": 70, "type": "consumable", "icon": "lightbulb", "category": "hints"},
            {"id": "skin_wizard", "name": "Skin Wizard", "description": "Desbloqueie o avatar Wizard mágico", "price": 200, "type": "skin", "icon": "wizard", "category": "skins", "skin_id": "wizard"},
            {"id": "skin_knight", "name": "Skin Knight", "description": "Desbloqueie o avatar Knight guerreiro", "price": 200, "type": "skin", "icon": "knight", "category": "skins", "skin_id": "knight"},
            {"id": "skin_ninja", "name": "Skin Ninja", "description": "Desbloqueie o avatar Ninja furtivo", "price": 300, "type": "skin", "icon": "ninja", "category": "skins", "skin_id": "ninja"},
            {"id": "skin_robot", "name": "Skin Robot", "description": "Desbloqueie o avatar Robot futurista", "price": 350, "type": "skin", "icon": "robot", "category": "skins", "skin_id": "robot"},
            {"id": "unlock_sql", "name": "SQL Dungeon Pass", "description": "Desbloqueie a SQL Dungeon", "price": 150, "type": "unlock", "icon": "key", "category": "unlocks", "language": "sql"},
            {"id": "unlock_python", "name": "Python Woods Pass", "description": "Desbloqueie Python Woods", "price": 150, "type": "unlock", "icon": "key", "category": "unlocks", "language": "python"},
            {"id": "unlock_java", "name": "Java Fortress Pass", "description": "Desbloqueie Java Fortress", "price": 200, "type": "unlock", "icon": "key", "category": "unlocks", "language": "java"},
            {"id": "xp_boost", "name": "XP Boost 2x", "description": "Dobra XP ganho por 10 quizzes", "price": 100, "type": "consumable", "icon": "zap", "category": "boosts"},
            {"id": "coin_boost", "name": "Coin Boost 2x", "description": "Dobra CodeCoins por 10 quizzes", "price": 100, "type": "consumable", "icon": "coins", "category": "boosts"},
        ]
        await db.shop_items.insert_many(default_items)
        for it in default_items:
            it.pop("_id", None)
        return default_items
    return items

@api_router.post("/shop/buy")
async def buy_item(data: ShopBuy):
    user = await db.users.find_one({"id": data.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(404, "Usuário não encontrado")
    item = await db.shop_items.find_one({"id": data.item_id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Item não encontrado")
    if user.get("codecoins", 0) < item["price"]:
        raise HTTPException(400, "CodeCoins insuficientes")
    await db.users.update_one({"id": data.user_id}, {"$inc": {"codecoins": -item["price"]}})
    purchase = {
        "id": str(uuid.uuid4())[:12],
        "user_id": data.user_id,
        "item_id": data.item_id,
        "item_name": item["name"],
        "item_type": item["type"],
        "price": item["price"],
        "purchased_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_inventory.insert_one(purchase)
    if item["type"] == "skin" and item.get("skin_id"):
        skins = user.get("skins_desbloqueadas", [])
        if item["skin_id"] not in skins:
            skins.append(item["skin_id"])
            await db.users.update_one({"id": data.user_id}, {"$set": {"skins_desbloqueadas": skins}})
    if item["type"] == "unlock" and item.get("language"):
        langs = user.get("linguagens_desbloqueadas", [])
        if item["language"] not in langs:
            langs.append(item["language"])
            await db.users.update_one({"id": data.user_id}, {"$set": {"linguagens_desbloqueadas": langs}})
    return {"message": f"{item['name']} comprado!", "item": item}

@api_router.get("/inventory/{user_id}")
async def get_inventory(user_id: str):
    items = await db.user_inventory.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    return items

# ============ PAIR PROGRAMMING ============

@api_router.get("/pair-programming/challenge")
async def get_pair_challenge(language: str = Query("csharp"), difficulty: int = Query(1)):
    pipeline = [
        {"$match": {"language": language, "type": "pair_programming"}},
        {"$sample": {"size": 1}},
        {"$project": {"_id": 0}}
    ]
    challenges = await db.pair_challenges.aggregate(pipeline).to_list(1)
    if not challenges:
        fallback = generate_pair_challenge(language, difficulty)
        return fallback
    return challenges[0]

def generate_pair_challenge(language: str, difficulty: int):
    challenges = {
        "csharp": [
            {"id": "pair_cs_1", "language": "csharp", "title": "Calcular Média Ponderada",
             "description": "Complete o método que calcula a média ponderada de uma lista de notas.",
             "starter_code": "public static double CalcularMedia(List<(double nota, double peso)> notas)\n{\n    double somaNotasPeso = 0;\n    double somaPesos = 0;\n    \n    foreach (var item in notas)\n    {\n        // TODO: Complete aqui\n        \n    }\n    \n    // TODO: Retorne a média\n    \n}",
             "solution": "public static double CalcularMedia(List<(double nota, double peso)> notas)\n{\n    double somaNotasPeso = 0;\n    double somaPesos = 0;\n    \n    foreach (var item in notas)\n    {\n        somaNotasPeso += item.nota * item.peso;\n        somaPesos += item.peso;\n    }\n    \n    return somaPesos > 0 ? somaNotasPeso / somaPesos : 0;\n}",
             "hints": ["Use item.nota e item.peso", "Multiplique nota pelo peso", "Divida pela soma dos pesos"],
             "xp_reward": 30, "coins_reward": 15, "difficulty": 2},
            {"id": "pair_cs_2", "language": "csharp", "title": "Filtrar Números Pares",
             "description": "Complete o método LINQ que filtra e retorna apenas números pares.",
             "starter_code": "public static List<int> FiltrarPares(List<int> numeros)\n{\n    // TODO: Use LINQ para filtrar pares\n    return numeros\n        // .Where(...)\n        // .ToList();\n}",
             "solution": "public static List<int> FiltrarPares(List<int> numeros)\n{\n    return numeros\n        .Where(n => n % 2 == 0)\n        .ToList();\n}",
             "hints": ["Use .Where() do LINQ", "n % 2 == 0 verifica se é par", "Não esqueça .ToList()"],
             "xp_reward": 25, "coins_reward": 12, "difficulty": 1},
        ],
        "sql": [
            {"id": "pair_sql_1", "language": "sql", "title": "JOIN com Agregação",
             "description": "Complete a query que retorna o total de vendas por cliente.",
             "starter_code": "SELECT c.nome, _____(v.valor) as total\nFROM clientes c\n_____ JOIN vendas v ON c.id = v.cliente_id\nGROUP BY _____\nORDER BY total DESC;",
             "solution": "SELECT c.nome, SUM(v.valor) as total\nFROM clientes c\nINNER JOIN vendas v ON c.id = v.cliente_id\nGROUP BY c.nome\nORDER BY total DESC;",
             "hints": ["Use SUM para somar valores", "INNER JOIN conecta as tabelas", "GROUP BY o campo do SELECT"],
             "xp_reward": 30, "coins_reward": 15, "difficulty": 2},
        ],
        "python": [
            {"id": "pair_py_1", "language": "python", "title": "List Comprehension",
             "description": "Complete a função que filtra e transforma uma lista usando list comprehension.",
             "starter_code": "def processar_notas(notas):\n    # Retorne apenas notas >= 7, multiplicadas por 1.1\n    # Use list comprehension\n    return [_____ for _____ in _____ if _____]",
             "solution": "def processar_notas(notas):\n    return [nota * 1.1 for nota in notas if nota >= 7]",
             "hints": ["nota * 1.1 é a transformação", "for nota in notas itera", "if nota >= 7 filtra"],
             "xp_reward": 25, "coins_reward": 12, "difficulty": 1},
        ],
        "java": [
            {"id": "pair_java_1", "language": "java", "title": "Stream API Filter",
             "description": "Complete o código usando Stream API para filtrar e coletar resultados.",
             "starter_code": "public List<String> filtrarNomes(List<String> nomes) {\n    return nomes.stream()\n        .filter(_____)  // nomes com mais de 3 letras\n        .map(_____)     // converter para maiúsculo\n        .collect(Collectors.toList());\n}",
             "solution": "public List<String> filtrarNomes(List<String> nomes) {\n    return nomes.stream()\n        .filter(n -> n.length() > 3)\n        .map(String::toUpperCase)\n        .collect(Collectors.toList());\n}",
             "hints": ["n -> n.length() > 3", "String::toUpperCase ou n -> n.toUpperCase()", "Collectors.toList() coleta"],
             "xp_reward": 30, "coins_reward": 15, "difficulty": 2},
        ]
    }
    lang_challenges = challenges.get(language, challenges["csharp"])
    valid = [c for c in lang_challenges if c["difficulty"] <= difficulty + 1]
    return random.choice(valid) if valid else lang_challenges[0]

@api_router.post("/pair-programming/validate")
async def validate_pair(data: PairValidate):
    xp = random.randint(20, 50)
    coins = random.randint(10, 25)
    await add_xp_to_user(data.user_id, xp)
    await add_coins_to_user(data.user_id, coins)
    return {
        "valid": True,
        "message": "Código validado com sucesso!",
        "xp_earned": xp,
        "coins_earned": coins,
        "feedback": "Bom trabalho! Seu código está correto."
    }

# ============ BUG HUNT ============

@api_router.get("/bug-hunt/challenge")
async def get_bug_hunt(language: str = Query("csharp"), difficulty: int = Query(1)):
    pipeline = [
        {"$match": {"language": language, "type": "bug_hunt"}},
        {"$sample": {"size": 1}},
        {"$project": {"_id": 0}}
    ]
    questions = await db.questions.aggregate(pipeline).to_list(1)
    if questions:
        return questions[0]
    return generate_bug_hunt_fallback(language)

def generate_bug_hunt_fallback(language: str):
    bugs = {
        "csharp": {"id": "bug_cs_fb", "language": "csharp", "type": "bug_hunt", "category": "errors",
                    "question": "Encontre o erro neste código C#:", "difficulty": 2,
                    "code_snippet": "string nome = null;\nint tamanho = nome.Length;\nConsole.WriteLine(tamanho);",
                    "options": ["NullReferenceException na linha 2", "Erro de sintaxe", "Erro de compilação", "Sem erro"],
                    "correct_answer": "0", "explanation": "Acessar .Length de uma string null causa NullReferenceException.",
                    "xp_reward": 20, "coins_reward": 10, "tags": ["null", "exception"]},
        "sql": {"id": "bug_sql_fb", "language": "sql", "type": "bug_hunt", "category": "errors",
                 "question": "Encontre o erro nesta query SQL:", "difficulty": 2,
                 "code_snippet": "SELECT nome, COUNT(*)\nFROM clientes\nWHERE cidade = 'SP'\nORDER BY nome;",
                 "options": ["Falta GROUP BY", "WHERE incorreto", "ORDER BY incorreto", "Sem erro"],
                 "correct_answer": "0", "explanation": "Usando COUNT(*) com outro campo requer GROUP BY.",
                 "xp_reward": 20, "coins_reward": 10, "tags": ["group_by", "aggregation"]},
        "python": {"id": "bug_py_fb", "language": "python", "type": "bug_hunt", "category": "errors",
                    "question": "Encontre o erro neste código Python:", "difficulty": 2,
                    "code_snippet": "lista = [1, 2, 3]\nfor i in range(len(lista)):\n    lista.append(i)\nprint(lista)",
                    "options": ["Loop infinito", "IndexError", "TypeError", "Sem erro"],
                    "correct_answer": "0", "explanation": "Adicionar à lista durante iteração com range(len()) causa loop infinito.",
                    "xp_reward": 20, "coins_reward": 10, "tags": ["loop", "mutation"]},
        "java": {"id": "bug_java_fb", "language": "java", "type": "bug_hunt", "category": "errors",
                  "question": "Encontre o erro neste código Java:", "difficulty": 2,
                  "code_snippet": "String s = \"hello\";\ns.toUpperCase();\nSystem.out.println(s);",
                  "options": ["String é imutável - resultado não salvo", "NullPointerException", "Erro de compilação", "Sem erro"],
                  "correct_answer": "0", "explanation": "Strings em Java são imutáveis. toUpperCase() retorna nova String.",
                  "xp_reward": 20, "coins_reward": 10, "tags": ["immutable", "string"]}
    }
    return bugs.get(language, bugs["csharp"])

# ============ INTERVIEW ============

@api_router.get("/interview/questions")
async def get_interview_questions(category: str = Query("dotnet"), count: int = 5):
    pipeline = [
        {"$match": {"type": "interview", "category": category}},
        {"$sample": {"size": count}},
        {"$project": {"_id": 0}}
    ]
    questions = await db.interview_questions.aggregate(pipeline).to_list(count)
    if not questions:
        return get_default_interview(category, count)
    return questions

def get_default_interview(category: str, count: int):
    all_questions = {
        "dotnet": [
            {"id": "int_dn_1", "question": "O que é o CLR no .NET?", "answer": "Common Language Runtime - é o ambiente de execução do .NET que gerencia memória, threads e segurança.", "category": "dotnet", "difficulty": 1},
            {"id": "int_dn_2", "question": "Qual a diferença entre value type e reference type em C#?", "answer": "Value types (struct, int, bool) são armazenados na stack. Reference types (class, string) são armazenados na heap com referência na stack.", "category": "dotnet", "difficulty": 2},
            {"id": "int_dn_3", "question": "O que é dependency injection?", "answer": "Padrão de design onde as dependências são injetadas externamente ao invés de criadas internamente, facilitando testes e manutenção.", "category": "dotnet", "difficulty": 2},
            {"id": "int_dn_4", "question": "Explique async/await em C#.", "answer": "async marca um método como assíncrono. await suspende a execução até a Task completar, liberando a thread para outros trabalhos.", "category": "dotnet", "difficulty": 3},
            {"id": "int_dn_5", "question": "O que é Entity Framework Core?", "answer": "ORM da Microsoft para .NET que permite trabalhar com banco de dados usando objetos C#, suportando Code First e Database First.", "category": "dotnet", "difficulty": 2},
        ],
        "sql": [
            {"id": "int_sql_1", "question": "Qual a diferença entre INNER JOIN e LEFT JOIN?", "answer": "INNER JOIN retorna apenas registros com correspondência em ambas tabelas. LEFT JOIN retorna todos da tabela esquerda + correspondências da direita.", "category": "sql", "difficulty": 1},
            {"id": "int_sql_2", "question": "O que é um índice no banco de dados?", "answer": "Estrutura de dados que melhora a velocidade de consultas em uma tabela, similar a um índice de livro.", "category": "sql", "difficulty": 1},
            {"id": "int_sql_3", "question": "Explique normalização de banco de dados.", "answer": "Processo de organizar dados para reduzir redundância. 1NF: valores atômicos. 2NF: sem dependências parciais. 3NF: sem dependências transitivas.", "category": "sql", "difficulty": 3},
            {"id": "int_sql_4", "question": "O que é uma stored procedure?", "answer": "Conjunto de instruções SQL pré-compiladas armazenadas no banco, que podem ser chamadas por nome, aceitam parâmetros e melhoram performance.", "category": "sql", "difficulty": 2},
            {"id": "int_sql_5", "question": "Qual a diferença entre WHERE e HAVING?", "answer": "WHERE filtra linhas antes do GROUP BY. HAVING filtra grupos depois do GROUP BY, permitindo condições em funções de agregação.", "category": "sql", "difficulty": 2},
        ],
        "python": [
            {"id": "int_py_1", "question": "O que são decorators em Python?", "answer": "Funções que modificam o comportamento de outras funções. Usam @decorator antes da definição da função.", "category": "python", "difficulty": 2},
            {"id": "int_py_2", "question": "Qual a diferença entre list e tuple?", "answer": "Lists são mutáveis, tuples são imutáveis. Tuples são mais rápidas e podem ser usadas como chaves de dicionário.", "category": "python", "difficulty": 1},
            {"id": "int_py_3", "question": "O que é GIL em Python?", "answer": "Global Interpreter Lock - mecanismo que permite apenas uma thread executar bytecode por vez no CPython, limitando paralelismo real.", "category": "python", "difficulty": 3},
        ],
        "java": [
            {"id": "int_java_1", "question": "Qual a diferença entre interface e abstract class em Java?", "answer": "Interface define contrato (métodos sem implementação). Abstract class pode ter implementação parcial. Classe pode implementar múltiplas interfaces mas herdar apenas uma abstract class.", "category": "java", "difficulty": 2},
            {"id": "int_java_2", "question": "O que é o garbage collector em Java?", "answer": "Processo automático que libera memória de objetos sem referência. Roda na JVM e pode ser influenciado mas não controlado diretamente.", "category": "java", "difficulty": 2},
        ]
    }
    return all_questions.get(category, all_questions["dotnet"])[:count]

# ============ LEADERBOARD ============

@api_router.get("/leaderboard/{user_id}")
async def get_leaderboard(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(404, "Usuário não encontrado")
    history = await db.leaderboard_history.find(
        {"user_id": user_id}, {"_id": 0}
    ).sort("date", -1).limit(30).to_list(30)
    today_entry = {
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "nivel": user.get("nivel", 1),
        "xp_total": user.get("xp", 0),
        "total_acertos": user.get("total_acertos", 0),
        "total_quizzes": user.get("total_quizzes", 0),
        "streak": user.get("streak_dias", 0)
    }
    return {"current": today_entry, "history": history}

# ============ POMODORO ============

@api_router.post("/pomodoro/complete")
async def complete_pomodoro(user_id: str = Query(...), minutes: int = Query(25)):
    bonus_xp = 15 if minutes >= 25 else 10
    bonus_coins = 8 if minutes >= 25 else 5
    await add_xp_to_user(user_id, bonus_xp)
    await add_coins_to_user(user_id, bonus_coins)
    return {"message": "Pomodoro completo!", "xp": bonus_xp, "coins": bonus_coins}

# ============ STATS ============

@api_router.get("/stats/{user_id}")
async def get_full_stats(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(404, "Usuário não encontrado")
    total_questions = await db.questions.count_documents({})
    return {
        "user": user,
        "total_questions_in_db": total_questions,
        "quiz_stats": user.get("quiz_stats", {}),
        "accuracy": round(user.get("total_acertos", 0) / max(user.get("total_quizzes", 1), 1) * 100, 1)
    }

# ============ SEED ENDPOINT ============

@api_router.post("/seed")
async def seed_database(force: bool = Query(False)):
    count = await db.questions.count_documents({})
    if count > 0 and not force:
        return {"message": f"Banco já tem {count} questões. Use force=true para re-seed.", "count": count}
    if force:
        await db.questions.delete_many({})
    from seed_data import generate_all_questions
    questions = generate_all_questions()
    if questions:
        batch_size = 500
        for i in range(0, len(questions), batch_size):
            batch = questions[i:i+batch_size]
            await db.questions.insert_many(batch)
    await db.questions.create_index("language")
    await db.questions.create_index("type")
    await db.questions.create_index("difficulty")
    await db.questions.create_index([("language", 1), ("type", 1), ("difficulty", 1)])
    return {"message": f"Seed completo! {len(questions)} questões inseridas.", "count": len(questions)}

@api_router.get("/health")
async def health():
    q_count = await db.questions.count_documents({})
    u_count = await db.users.count_documents({})
    return {"status": "ok", "questions": q_count, "users": u_count}

# ============ STARTUP ============

@app.on_event("startup")
async def startup():
    logger.info("CodeQuest Backend starting...")
    count = await db.questions.count_documents({})
    if count == 0:
        logger.info("No questions found. Auto-seeding...")
        try:
            from seed_data import generate_all_questions
            questions = generate_all_questions()
            if questions:
                batch_size = 500
                for i in range(0, len(questions), batch_size):
                    batch = questions[i:i+batch_size]
                    await db.questions.insert_many(batch)
                await db.questions.create_index("language")
                await db.questions.create_index("type")
                await db.questions.create_index("difficulty")
                await db.questions.create_index([("language", 1), ("type", 1), ("difficulty", 1)])
                logger.info(f"Auto-seeded {len(questions)} questions!")
            else:
                logger.warning("No questions generated!")
        except Exception as e:
            logger.error(f"Auto-seed failed: {e}")
    else:
        logger.info(f"Database has {count} questions. Skipping seed.")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
