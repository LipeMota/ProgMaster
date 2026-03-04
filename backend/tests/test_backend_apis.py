"""
CodeQuest Backend API Tests
Tests covering: Health, User, Questions, Quiz, Missions, Shop, Pair Programming, Bug Hunt
"""
import pytest
import requests
import os

# Load from frontend .env if not in environment
BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL')
if not BASE_URL:
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
                    BASE_URL = line.split('=', 1)[1].strip()
                    break
    except:
        BASE_URL = 'https://coding-dungeon.preview.emergentagent.com'

BASE_URL = BASE_URL.rstrip('/')

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture
def test_user(api_client):
    """Create a test user and return user data"""
    response = api_client.post(f"{BASE_URL}/api/user", json={
        "nome": "TEST_Pytest_User",
        "avatar_id": "hacker"
    })
    assert response.status_code == 200
    user = response.json()
    assert "id" in user
    return user

# ============ HEALTH ENDPOINT ============

class TestHealth:
    """Health check and database status"""
    
    def test_health_endpoint(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "questions" in data
        print(f"✓ Health check passed: {data['questions']} questions in DB")
    
    def test_health_has_4200_questions(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/health")
        data = response.json()
        assert data["questions"] >= 4200, f"Expected 4200+ questions, got {data['questions']}"
        print(f"✓ Database has {data['questions']} questions")

# ============ USER ENDPOINTS ============

class TestUser:
    """User CRUD operations"""
    
    def test_create_user(self, api_client):
        payload = {"nome": "TEST_NewUser", "avatar_id": "wizard"}
        response = api_client.post(f"{BASE_URL}/api/user", json=payload)
        assert response.status_code == 200
        user = response.json()
        assert user["nome"] == "TEST_NewUser"
        assert user["avatar_id"] == "wizard"
        assert user["nivel"] == 1
        assert user["xp"] == 0
        assert user["codecoins"] == 100
        print(f"✓ User created: {user['id']}")
    
    def test_get_user(self, test_user, api_client):
        response = api_client.get(f"{BASE_URL}/api/user/{test_user['id']}")
        assert response.status_code == 200
        user = response.json()
        assert user["id"] == test_user["id"]
        assert user["nome"] == test_user["nome"]
        print(f"✓ User retrieved: {user['nome']}")
    
    def test_update_user(self, test_user, api_client):
        response = api_client.put(f"{BASE_URL}/api/user/{test_user['id']}", json={
            "nome": "TEST_Updated"
        })
        assert response.status_code == 200
        updated = response.json()
        assert updated["nome"] == "TEST_Updated"
        print(f"✓ User updated: {updated['nome']}")
    
    def test_add_xp(self, test_user, api_client):
        response = api_client.post(f"{BASE_URL}/api/user/{test_user['id']}/add-xp", json={
            "xp": 50, "source": "test"
        })
        assert response.status_code == 200
        result = response.json()
        assert "xp" in result
        print(f"✓ XP added: {result['xp']} XP")
    
    def test_add_coins(self, test_user, api_client):
        response = api_client.post(f"{BASE_URL}/api/user/{test_user['id']}/add-coins", json={
            "coins": 25, "source": "test"
        })
        assert response.status_code == 200
        result = response.json()
        assert "codecoins" in result
        print(f"✓ Coins added: {result['codecoins']} coins")

# ============ QUESTIONS ENDPOINTS ============

class TestQuestions:
    """Questions and categories"""
    
    def test_get_question_counts(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/questions/count")
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "by_language" in data
        assert data["total"] >= 4200
        print(f"✓ Question counts: {data['total']} total")
    
    def test_get_questions_by_language(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/questions?language=csharp&limit=5")
        assert response.status_code == 200
        questions = response.json()
        assert isinstance(questions, list)
        assert len(questions) > 0
        assert all(q["language"] == "csharp" for q in questions)
        print(f"✓ Retrieved {len(questions)} C# questions")
    
    def test_get_random_questions(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/questions/random?language=sql&count=3")
        assert response.status_code == 200
        questions = response.json()
        assert len(questions) == 3
        assert all(q["language"] == "sql" for q in questions)
        print(f"✓ Retrieved {len(questions)} random SQL questions")
    
    def test_get_categories(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/questions/categories?language=python")
        assert response.status_code == 200
        categories = response.json()
        assert isinstance(categories, list)
        print(f"✓ Retrieved {len(categories)} Python categories")

# ============ QUIZ ENDPOINTS ============

class TestQuiz:
    """Quiz flow: start, answer, history"""
    
    def test_start_quiz(self, test_user, api_client):
        response = api_client.post(f"{BASE_URL}/api/quiz/start", json={
            "user_id": test_user["id"],
            "language": "csharp",
            "question_type": "mcq",
            "count": 5
        })
        assert response.status_code == 200
        data = response.json()
        assert "session" in data
        assert "questions" in data
        assert len(data["questions"]) == 5
        assert data["session"]["language"] == "csharp"
        print(f"✓ Quiz started: {len(data['questions'])} questions")
    
    def test_submit_answer(self, test_user, api_client):
        # Start quiz first
        start_resp = api_client.post(f"{BASE_URL}/api/quiz/start", json={
            "user_id": test_user["id"],
            "language": "java",
            "question_type": "mcq",
            "count": 1
        })
        questions = start_resp.json()["questions"]
        q = questions[0]
        
        # Submit answer
        response = api_client.post(f"{BASE_URL}/api/quiz/answer", json={
            "user_id": test_user["id"],
            "question_id": q["id"],
            "answer": "0"
        })
        assert response.status_code == 200
        result = response.json()
        assert "correct" in result
        assert "correct_answer" in result
        assert "xp_earned" in result
        print(f"✓ Answer submitted: correct={result['correct']}, xp={result['xp_earned']}")
    
    def test_quiz_history(self, test_user, api_client):
        response = api_client.get(f"{BASE_URL}/api/quiz/history/{test_user['id']}")
        assert response.status_code == 200
        history = response.json()
        assert isinstance(history, list)
        print(f"✓ Quiz history: {len(history)} sessions")

# ============ MISSIONS ENDPOINTS ============

class TestMissions:
    """Daily, weekly, boss missions"""
    
    def test_get_daily_missions(self, test_user, api_client):
        response = api_client.get(f"{BASE_URL}/api/missions/daily/{test_user['id']}")
        assert response.status_code == 200
        missions = response.json()
        assert isinstance(missions, list)
        assert len(missions) > 0
        print(f"✓ Daily missions: {len(missions)}")
    
    def test_get_weekly_missions(self, test_user, api_client):
        response = api_client.get(f"{BASE_URL}/api/missions/weekly/{test_user['id']}")
        assert response.status_code == 200
        missions = response.json()
        assert isinstance(missions, list)
        assert len(missions) > 0
        print(f"✓ Weekly missions: {len(missions)}")
    
    def test_get_boss_missions(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/missions/boss")
        assert response.status_code == 200
        bosses = response.json()
        assert isinstance(bosses, list)
        assert len(bosses) == 4  # 4 bosses: SQL, C#, Python, Java
        print(f"✓ Boss missions: {len(bosses)}")

# ============ SHOP ENDPOINTS ============

class TestShop:
    """Shop items and purchases"""
    
    def test_get_shop_items(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/shop/items")
        assert response.status_code == 200
        items = response.json()
        assert isinstance(items, list)
        assert len(items) > 0
        print(f"✓ Shop items: {len(items)}")
    
    def test_buy_item(self, test_user, api_client):
        # Get cheap item
        items_resp = api_client.get(f"{BASE_URL}/api/shop/items")
        items = items_resp.json()
        cheap_item = min(items, key=lambda x: x["price"])
        
        # Add enough coins
        api_client.post(f"{BASE_URL}/api/user/{test_user['id']}/add-coins", json={
            "coins": cheap_item["price"] + 100
        })
        
        # Buy item
        response = api_client.post(f"{BASE_URL}/api/shop/buy", json={
            "user_id": test_user["id"],
            "item_id": cheap_item["id"]
        })
        assert response.status_code == 200
        result = response.json()
        assert "message" in result
        print(f"✓ Item purchased: {cheap_item['name']}")
    
    def test_get_inventory(self, test_user, api_client):
        response = api_client.get(f"{BASE_URL}/api/inventory/{test_user['id']}")
        assert response.status_code == 200
        inventory = response.json()
        assert isinstance(inventory, list)
        print(f"✓ Inventory: {len(inventory)} items")

# ============ PAIR PROGRAMMING ============

class TestPairProgramming:
    """Pair programming challenges"""
    
    def test_get_pair_challenge(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/pair-programming/challenge?language=csharp&difficulty=1")
        assert response.status_code == 200
        challenge = response.json()
        assert "id" in challenge
        assert "language" in challenge
        assert challenge["language"] == "csharp"
        print(f"✓ Pair challenge: {challenge.get('title', 'Retrieved')}")
    
    def test_validate_pair(self, test_user, api_client):
        response = api_client.post(f"{BASE_URL}/api/pair-programming/validate", json={
            "user_id": test_user["id"],
            "challenge_id": "test_challenge",
            "code": "test code"
        })
        assert response.status_code == 200
        result = response.json()
        assert "valid" in result
        assert "xp_earned" in result
        print(f"✓ Pair validation: xp={result['xp_earned']}")

# ============ BUG HUNT ============

class TestBugHunt:
    """Bug hunt challenges"""
    
    def test_get_bug_hunt(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/bug-hunt/challenge?language=python&difficulty=2")
        assert response.status_code == 200
        challenge = response.json()
        assert "id" in challenge
        assert "language" in challenge
        assert challenge["language"] == "python"
        print(f"✓ Bug hunt challenge: {challenge.get('question', 'Retrieved')}")

# ============ INTERVIEW ============

class TestInterview:
    """Interview questions"""
    
    def test_get_interview_questions(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/interview/questions?category=dotnet&count=3")
        assert response.status_code == 200
        questions = response.json()
        assert isinstance(questions, list)
        assert len(questions) == 3
        print(f"✓ Interview questions: {len(questions)}")

# ============ POMODORO ============

class TestPomodoro:
    """Pomodoro timer completion"""
    
    def test_complete_pomodoro(self, test_user, api_client):
        response = api_client.post(f"{BASE_URL}/api/pomodoro/complete?user_id={test_user['id']}&minutes=25")
        assert response.status_code == 200
        result = response.json()
        assert "xp" in result
        assert "coins" in result
        print(f"✓ Pomodoro completed: +{result['xp']} XP, +{result['coins']} coins")

# ============ STATS ============

class TestStats:
    """User statistics"""
    
    def test_get_stats(self, test_user, api_client):
        response = api_client.get(f"{BASE_URL}/api/stats/{test_user['id']}")
        assert response.status_code == 200
        stats = response.json()
        assert "user" in stats
        assert "total_questions_in_db" in stats
        print(f"✓ Stats retrieved: {stats['total_questions_in_db']} questions in DB")
