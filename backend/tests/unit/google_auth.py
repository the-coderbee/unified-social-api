def test_google_get_authorization_url(client):
    response = client.get("/auth/google/authorization-url")
    assert response.status_code == 200
    assert "authorization_url" in response.json()