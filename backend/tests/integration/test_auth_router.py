
async def test_register(client):
    payload = {
            "email": "testuser@email.com",
            "password": "goodpassword123",
        }
    response = await client.post(
        "/api/v1/auth/register", 
        json=payload,
    )
    
    print(response.json())
    assert response.status_code == 201
    data = response.json()
    
    assert data.get("id") is not None
    assert data.get("email") == "testuser@email.com"
    assert data.get("is_active") == True

async def test_register_duplicate_email(client):
    payload = {
            "email": "duplicate@email.com",
            "password": "goodpassword123",
        }
    
    response1 = await client.post("/api/v1/auth/register", json=payload)
    assert response1.status_code == 201
    
    response2 = await client.post("/api/v1/auth/register", json=payload)
    assert response2.status_code == 400

async def test_register_invalid_password(client):
    payload = {
            "email": "testuser@email.com",
            "password": "short",
        }
    
    response = await client.post("/api/v1/auth/register", json=payload)

    assert response.status_code == 422
