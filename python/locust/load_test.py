from locust import HttpUser, task, between

class SimpleUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def get_products(self):
        self.client.get("/products")

    @task
    def search(self):
        self.client.get("/products/search?q=Laptop")
