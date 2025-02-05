# 📘 User API Documentation  

This documentation provides details about the **User API**, including authentication, endpoints, and request/response formats.

## 📌 Base URL  
```
http://your-api-domain.com/api/users
```

---

## 🔑 Authentication  
- The API uses **JWT (JSON Web Token)** for authentication.  
- Except for `/register` and `/login`, all endpoints require a **Bearer Token** in the `Authorization` header.  
- Format:  
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```

---

## 📜 Endpoints  

### **1️⃣ Register a User**  
**Endpoint:** `POST /register`  
**Description:** Registers a new user and returns a JWT token.  

#### **📥 Request Body:**  
```json
{
  "phone": "1234567890",
  "password": "your_secure_password"
}
```

#### **📤 Response:**  
```json
{
  "user": {
    "_id": "65a4d2...",
    "phone": "1234567890",
    "password": "hashed_password"
  },
  "token": "your_generated_jwt_token"
}
```

---

### **2️⃣ Login a User**  
**Endpoint:** `POST /login`  
**Description:** Authenticates a user and returns a JWT token.  

#### **📥 Request Body:**  
```json
{
  "phone": "1234567890",
  "password": "your_secure_password"
}
```

#### **📤 Response:**  
```json
{
  "user": {
    "_id": "65a4d2...",
    "phone": "1234567890",
    "password": "hashed_password"
  },
  "token": "your_generated_jwt_token"
}
```

---

### **3️⃣ Get All Users** (🔒 Requires Authentication)  
**Endpoint:** `GET /`  
**Description:** Fetches all registered users.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
[
  {
    "_id": "65a4d2...",
    "phone": "1234567890",
    "password": "hashed_password"
  },
  {
    "_id": "65a4d3...",
    "phone": "0987654321",
    "password": "hashed_password"
  }
]
```

---

### **4️⃣ Get a User by Phone** (🔒 Requires Authentication)  
**Endpoint:** `GET /{phone}`  
**Description:** Fetches a user by phone number.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "_id": "65a4d2...",
  "phone": "1234567890",
  "password": "hashed_password"
}
```

---

### **5️⃣ Update a User** (🔒 Requires Authentication)  
**Endpoint:** `PUT /{phone}`  
**Description:** Updates user information, including password.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📥 Request Body:**  
```json
{
  "password": "new_secure_password"
}
```

#### **📤 Response:**  
```json
{
  "_id": "65a4d2...",
  "phone": "1234567890",
  "password": "new_hashed_password"
}
```

---

### **6️⃣ Delete a User** (🔒 Requires Authentication)  
**Endpoint:** `DELETE /{phone}`  
**Description:** Deletes a user from the database.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "message": "User deleted successfully"
}
```

---

## ⚠️ Error Responses  

| Status Code | Message                  | Description |
|------------|--------------------------|-------------|
| 400        | `User already exists`      | Registration failed due to duplicate phone number. |
| 400        | `Invalid credentials`      | Incorrect phone number or password. |
| 401        | `Access denied`            | No token provided or invalid token. |
| 404        | `User not found`           | The requested user does not exist. |
| 500        | `Failed to create user`    | Internal server error while registering. |

---

## 🚀 Usage Example (Postman or cURL)  

### **🔹 Login and Fetch Users**
```sh
curl -X POST http://your-api-domain.com/api/users/login \
-H "Content-Type: application/json" \
-d '{"phone": "1234567890", "password": "your_secure_password"}'
```

```sh
curl -X GET http://your-api-domain.com/api/users/ \
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📩 Contact  
For support or issues, contact **[Your Name]** at **your@email.com**.  

Here is the **agents.md** documentation file for the **Agent API** in Markdown format:

---

# 📘 Agent API Documentation

This documentation provides details about the **Agent API**, including authentication, endpoints, and request/response formats.

## 📌 Base URL  
```
http://your-api-domain.com/api/agents
```

---

## 🔑 Authentication  
- The API uses **JWT (JSON Web Token)** for authentication.  
- All endpoints (except the `register` and `login`) require a **Bearer Token** in the `Authorization` header.  
- Format:  
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```

---

## 📜 Endpoints  

### **1️⃣ Create a New Agent**  
**Endpoint:** `POST /create`  
**Description:** Creates a new agent. Only authenticated users can create agents.  

#### **📥 Request Body:**  
```json
{
  "station_uuid": "station_unique_id",
  "agent_uuid": "agent_unique_id",
  "fullname": "Agent Name",
  "transaction_pin": "secure_pin"
}
```

#### **📤 Response:**  
```json
{
  "message": "Agent created successfully",
  "agent": {
    "_id": "agent_unique_id",
    "station_uuid": "station_unique_id",
    "agent_uuid": "agent_unique_id",
    "fullname": "Agent Name",
    "transaction_pin": "hashed_pin"
  }
}
```

---

### **2️⃣ Get All Agents** (🔒 Requires Authentication)  
**Endpoint:** `GET /`  
**Description:** Retrieves all agents.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
[
  {
    "_id": "agent_unique_id",
    "station_uuid": "station_unique_id",
    "agent_uuid": "agent_unique_id",
    "fullname": "Agent Name",
    "transaction_pin": "hashed_pin"
  },
  {
    "_id": "agent_unique_id_2",
    "station_uuid": "station_unique_id_2",
    "agent_uuid": "agent_unique_id_2",
    "fullname": "Agent Name 2",
    "transaction_pin": "hashed_pin"
  }
]
```

---

### **3️⃣ Get a Single Agent by UUID** (🔒 Requires Authentication)  
**Endpoint:** `GET /{agent_uuid}`  
**Description:** Retrieves a specific agent by their unique UUID.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "_id": "agent_unique_id",
  "station_uuid": "station_unique_id",
  "agent_uuid": "agent_unique_id",
  "fullname": "Agent Name",
  "transaction_pin": "hashed_pin"
}
```

---

### **4️⃣ Update an Agent** (🔒 Requires Authentication)  
**Endpoint:** `PUT /{agent_uuid}`  
**Description:** Updates the details of an agent, including transaction pin.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📥 Request Body:**  
```json
{
  "fullname": "Updated Agent Name",
  "transaction_pin": "new_secure_pin"
}
```

#### **📤 Response:**  
```json
{
  "message": "Agent updated successfully",
  "agent": {
    "_id": "agent_unique_id",
    "station_uuid": "station_unique_id",
    "agent_uuid": "agent_unique_id",
    "fullname": "Updated Agent Name",
    "transaction_pin": "new_hashed_pin"
  }
}
```

---

### **5️⃣ Delete an Agent** (🔒 Requires Authentication)  
**Endpoint:** `DELETE /{agent_uuid}`  
**Description:** Deletes a specific agent by their unique UUID.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "message": "Agent deleted successfully"
}
```

---

## ⚠️ Error Responses  

| Status Code | Message                  | Description |
|-------------|--------------------------|-------------|
| 400         | `Bad request`             | The request was malformed or missing required data. |
| 401         | `Access denied`           | No token provided or invalid token. |
| 404         | `Agent not found`         | The agent with the specified UUID does not exist. |
| 500         | `Server error`            | Internal server error while processing the request. |

---

## 🚀 Usage Example (Postman or cURL)  

### **🔹 Create a New Agent**
```sh
curl -X POST http://your-api-domain.com/api/agents/create \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "station_uuid": "station_unique_id",
  "agent_uuid": "agent_unique_id",
  "fullname": "Agent Name",
  "transaction_pin": "secure_pin"
}'
```

### **🔹 Get All Agents**
```sh
curl -X GET http://your-api-domain.com/api/agents/ \
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```


---

# 📘 Bank API Documentation

This documentation provides details about the **Bank API**, including authentication, endpoints, and request/response formats.

## 📌 Base URL  
```
http://your-api-domain.com/api/banks
```

---

## 🔑 Authentication  
- The API uses **JWT (JSON Web Token)** for authentication.  
- All endpoints (except the `register` and `login`) require a **Bearer Token** in the `Authorization` header.  
- Format:  
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```

---

## 📜 Endpoints  

### **1️⃣ Create a New Bank**  
**Endpoint:** `POST /`  
**Description:** Creates a new bank. Only authenticated users can create banks.  

#### **📥 Request Body:**  
```json
{
  "bank_uuid": "bank_unique_id",
  "bank_name": "Bank Name",
  "account_number": "123456789",
  "location": "City, Country"
}
```

#### **📤 Response:**  
```json
{
  "message": "Bank created successfully",
  "bank": {
    "_id": "bank_unique_id",
    "bank_uuid": "bank_unique_id",
    "bank_name": "Bank Name",
    "account_number": "123456789",
    "location": "City, Country"
  }
}
```

---

### **2️⃣ Get All Banks** (🔒 Requires Authentication)  
**Endpoint:** `GET /`  
**Description:** Retrieves all banks.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
[
  {
    "_id": "bank_unique_id",
    "bank_uuid": "bank_unique_id",
    "bank_name": "Bank Name",
    "account_number": "123456789",
    "location": "City, Country"
  },
  {
    "_id": "bank_unique_id_2",
    "bank_uuid": "bank_unique_id_2",
    "bank_name": "Bank Name 2",
    "account_number": "987654321",
    "location": "City, Country 2"
  }
]
```

---

### **3️⃣ Get a Specific Bank by UUID** (🔒 Requires Authentication)  
**Endpoint:** `GET /{bank_uuid}`  
**Description:** Retrieves a specific bank by its UUID.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "_id": "bank_unique_id",
  "bank_uuid": "bank_unique_id",
  "bank_name": "Bank Name",
  "account_number": "123456789",
  "location": "City, Country"
}
```

---

### **4️⃣ Update a Bank** (🔒 Requires Authentication)  
**Endpoint:** `PUT /{bank_uuid}`  
**Description:** Updates the details of a bank.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📥 Request Body:**  
```json
{
  "bank_name": "Updated Bank Name",
  "account_number": "987654321",
  "location": "New City, New Country"
}
```

#### **📤 Response:**  
```json
{
  "message": "Bank updated successfully",
  "bank": {
    "_id": "bank_unique_id",
    "bank_uuid": "bank_unique_id",
    "bank_name": "Updated Bank Name",
    "account_number": "987654321",
    "location": "New City, New Country"
  }
}
```

---

### **5️⃣ Delete a Bank** (🔒 Requires Authentication)  
**Endpoint:** `DELETE /{bank_uuid}`  
**Description:** Deletes a specific bank by its UUID.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "message": "Bank deleted successfully"
}
```

---

## ⚠️ Error Responses  

| Status Code | Message                  | Description |
|-------------|--------------------------|-------------|
| 400         | `Bad request`             | The request was malformed or missing required data. |
| 401         | `Access denied`           | No token provided or invalid token. |
| 404         | `Bank not found`          | The bank with the specified UUID does not exist. |
| 500         | `Server error`            | Internal server error while processing the request. |

---

## 🚀 Usage Example (Postman or cURL)  

### **🔹 Create a New Bank**
```sh
curl -X POST http://your-api-domain.com/api/banks/ \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "bank_uuid": "bank_unique_id",
  "bank_name": "Bank Name",
  "account_number": "123456789",
  "location": "City, Country"
}'
```

### **🔹 Get All Banks**
```sh
curl -X GET http://your-api-domain.com/api/banks/ \
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```
---

# 📘 Card API Documentation

## 📌 Base URL  
```
http://your-api-domain.com/api/cards
```

---

## 🔑 Authentication  
- The API uses **JWT (JSON Web Token)** for authentication.  
- All endpoints (except the `register` and `login`) require a **Bearer Token** in the `Authorization` header.  
- Format:  
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```

---

## 📜 Endpoints  

### **1️⃣ Create a New Card**  
**Endpoint:** `POST /`  
**Description:** Creates a new card. Only authenticated users can create cards.  

#### **📥 Request Body:**  
```json
{
  "user_uuid": "user_unique_id",
  "card_uuid": "card_unique_id",
  "card_number": "1234567812345678",
  "expiry_date": "12/23",
  "cvc": "123",
  "name": "Cardholder Name"
}
```

#### **📤 Response:**  
```json
{
  "message": "Card created successfully",
  "card": {
    "_id": "card_unique_id",
    "user_uuid": "user_unique_id",
    "card_uuid": "card_unique_id",
    "card_number": "1234567812345678",
    "expiry_date": "12/23",
    "cvc": "123",
    "name": "Cardholder Name"
  }
}
```

---

### **2️⃣ Get All Cards** (🔒 Requires Authentication)  
**Endpoint:** `GET /`  
**Description:** Retrieves all cards.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
[
  {
    "_id": "card_unique_id",
    "user_uuid": "user_unique_id",
    "card_uuid": "card_unique_id",
    "card_number": "1234567812345678",
    "expiry_date": "12/23",
    "cvc": "123",
    "name": "Cardholder Name"
  },
  {
    "_id": "card_unique_id_2",
    "user_uuid": "user_unique_id_2",
    "card_uuid": "card_unique_id_2",
    "card_number": "9876543298765432",
    "expiry_date": "01/25",
    "cvc": "456",
    "name": "Another Cardholder"
  }
]
```

---

### **3️⃣ Get a Specific Card by UUID** (🔒 Requires Authentication)  
**Endpoint:** `GET /{card_uuid}`  
**Description:** Retrieves a specific card by its UUID.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "_id": "card_unique_id",
  "user_uuid": "user_unique_id",
  "card_uuid": "card_unique_id",
  "card_number": "1234567812345678",
  "expiry_date": "12/23",
  "cvc": "123",
  "name": "Cardholder Name"
}
```

---

### **4️⃣ Update a Card** (🔒 Requires Authentication)  
**Endpoint:** `PUT /{card_uuid}`  
**Description:** Updates the details of a card.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📥 Request Body:**  
```json
{
  "card_number": "9876543298765432",
  "expiry_date": "01/25",
  "cvc": "456",
  "name": "Updated Cardholder"
}
```

#### **📤 Response:**  
```json
{
  "message": "Card updated successfully",
  "card": {
    "_id": "card_unique_id",
    "user_uuid": "user_unique_id",
    "card_uuid": "card_unique_id",
    "card_number": "9876543298765432",
    "expiry_date": "01/25",
    "cvc": "456",
    "name": "Updated Cardholder"
  }
}
```

---

### **5️⃣ Delete a Card** (🔒 Requires Authentication)  
**Endpoint:** `DELETE /{card_uuid}`  
**Description:** Deletes a specific card by its UUID.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "message": "Card deleted successfully"
}
```

---

## ⚠️ Error Responses  

| Status Code | Message                  | Description |
|-------------|--------------------------|-------------|
| 400         | `Bad request`             | The request was malformed or missing required data. |
| 401         | `Access denied`           | No token provided or invalid token. |
| 404         | `Card not found`          | The card with the specified UUID does not exist. |
| 500         | `Server error`            | Internal server error while processing the request. |

---

## 🚀 Usage Example (Postman or cURL)  

### **🔹 Create a New Card**
```sh
curl -X POST http://your-api-domain.com/api/cards/ \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "user_uuid": "user_unique_id",
  "card_uuid": "card_unique_id",
  "card_number": "1234567812345678",
  "expiry_date": "12/23",
  "cvc": "123",
  "name": "Cardholder Name"
}'
```

### **🔹 Get All Cards**
```sh
curl -X GET http://your-api-domain.com/api/cards/ \
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

# 📘 Car API Documentation

This documentation provides details about the **Car API**, including authentication, endpoints, and request/response formats.

## 📌 Base URL  
```
http://your-api-domain.com/api/cars
```

---

## 🔑 Authentication  
- The API uses **JWT (JSON Web Token)** for authentication.  
- All endpoints (except the `register` and `login`) require a **Bearer Token** in the `Authorization` header.  
- Format:  
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```

---

## 📜 Endpoints  

### **1️⃣ Create a New Car**  
**Endpoint:** `POST /create`  
**Description:** Creates a new car.  

#### **📥 Request Body:**  
```json
{
  "user_uuid": "user_unique_id",
  "car_uuid": "car_unique_id",
  "car_model": "Toyota Corolla",
  "car_number": "ABC1234",
  "fuel_type": "Petrol",
  "picture": "url-to-car-image"
}
```

#### **📤 Response:**  
```json
{
  "message": "Car created successfully",
  "car": {
    "_id": "car_unique_id",
    "user_uuid": "user_unique_id",
    "car_uuid": "car_unique_id",
    "car_model": "Toyota Corolla",
    "car_number": "ABC1234",
    "fuel_type": "Petrol",
    "picture": "url-to-car-image"
  }
}
```

---

### **2️⃣ Get All Cars** (🔒 Requires Authentication)  
**Endpoint:** `GET /`  
**Description:** Retrieves all cars.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
[
  {
    "_id": "car_unique_id",
    "user_uuid": "user_unique_id",
    "car_uuid": "car_unique_id",
    "car_model": "Toyota Corolla",
    "car_number": "ABC1234",
    "fuel_type": "Petrol",
    "picture": "url-to-car-image"
  },
  {
    "_id": "car_unique_id_2",
    "user_uuid": "user_unique_id_2",
    "car_uuid": "car_unique_id_2",
    "car_model": "Honda Civic",
    "car_number": "XYZ5678",
    "fuel_type": "Diesel",
    "picture": "url-to-car-image"
  }
]
```

---

### **3️⃣ Get a Specific Car by UUID** (🔒 Requires Authentication)  
**Endpoint:** `GET /{car_uuid}`  
**Description:** Retrieves a specific car by its UUID.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "_id": "car_unique_id",
  "user_uuid": "user_unique_id",
  "car_uuid": "car_unique_id",
  "car_model": "Toyota Corolla",
  "car_number": "ABC1234",
  "fuel_type": "Petrol",
  "picture": "url-to-car-image"
}
```

---

### **4️⃣ Update a Car** (🔒 Requires Authentication)  
**Endpoint:** `PUT /{car_uuid}`  
**Description:** Updates the details of a car.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📥 Request Body:**  
```json
{
  "car_model": "Honda Accord",
  "car_number": "XYZ9876",
  "fuel_type": "Hybrid",
  "picture": "url-to-updated-car-image"
}
```

#### **📤 Response:**  
```json
{
  "message": "Car updated successfully",
  "car": {
    "_id": "car_unique_id",
    "user_uuid": "user_unique_id",
    "car_uuid": "car_unique_id",
    "car_model": "Honda Accord",
    "car_number": "XYZ9876",
    "fuel_type": "Hybrid",
    "picture": "url-to-updated-car-image"
  }
}
```

---

### **5️⃣ Delete a Car** (🔒 Requires Authentication)  
**Endpoint:** `DELETE /{car_uuid}`  
**Description:** Deletes a specific car by its UUID.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "message": "Car deleted successfully"
}
```

---

## ⚠️ Error Responses  

| Status Code | Message                  | Description |
|-------------|--------------------------|-------------|
| 400         | `Bad request`             | The request was malformed or missing required data. |
| 401         | `Access denied`           | No token provided or invalid token. |
| 404         | `Car not found`           | The car with the specified UUID does not exist. |
| 500         | `Server error`            | Internal server error while processing the request. |

---

## 🚀 Usage Example (Postman or cURL)  

### **🔹 Create a New Car**
```sh
curl -X POST http://your-api-domain.com/api/cars/create \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "user_uuid": "user_unique_id",
  "car_uuid": "car_unique_id",
  "car_model": "Toyota Corolla",
  "car_number": "ABC1234",
  "fuel_type": "Petrol",
  "picture": "url-to-car-image"
}'
```

### **🔹 Get All Cars**
```sh
curl -X GET http://your-api-domain.com/api/cars/ \
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---
Here is the **Loan API Documentation** in Markdown format:

---

# 📘 Loan API Documentation

## 📌 Base URL  
```
http://your-api-domain.com/api/loans
```

---

## 🔑 Authentication  
- The API uses **JWT (JSON Web Token)** for authentication.  
- All endpoints (except the `register` and `login`) require a **Bearer Token** in the `Authorization` header.  
- Format:  
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```

---

## 📜 Endpoints  

### **1️⃣ Create a New Loan**  
**Endpoint:** `POST /`  
**Description:** Creates a new loan.  

#### **📥 Request Body:**  
```json
{
  "loan_uuid": "loan_unique_id",
  "user_uuid": "user_unique_id",
  "amount": 5000,
  "agent_uuid": "agent_unique_id",
  "car_uuid": "car_unique_id",
  "status": "Pending"
}
```

#### **📤 Response:**  
```json
{
  "message": "Loan created successfully",
  "loan": {
    "_id": "loan_unique_id",
    "loan_uuid": "loan_unique_id",
    "user_uuid": "user_unique_id",
    "amount": 5000,
    "balance": 5000,
    "agent_uuid": "agent_unique_id",
    "car_uuid": "car_unique_id",
    "status": "Pending"
  }
}
```

---

### **2️⃣ Get All Loans** (🔒 Requires Authentication)  
**Endpoint:** `GET /`  
**Description:** Retrieves all loans.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
[
  {
    "_id": "loan_unique_id",
    "loan_uuid": "loan_unique_id",
    "user_uuid": "user_unique_id",
    "amount": 5000,
    "balance": 5000,
    "agent_uuid": "agent_unique_id",
    "car_uuid": "car_unique_id",
    "status": "Pending"
  },
  {
    "_id": "loan_unique_id_2",
    "loan_uuid": "loan_unique_id_2",
    "user_uuid": "user_unique_id_2",
    "amount": 3000,
    "balance": 1500,
    "agent_uuid": "agent_unique_id_2",
    "car_uuid": "car_unique_id_2",
    "status": "Approved"
  }
]
```

---

### **3️⃣ Get a Specific Loan by UUID** (🔒 Requires Authentication)  
**Endpoint:** `GET /{loan_uuid}`  
**Description:** Retrieves a specific loan by its UUID.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "_id": "loan_unique_id",
  "loan_uuid": "loan_unique_id",
  "user_uuid": "user_unique_id",
  "amount": 5000,
  "balance": 5000,
  "agent_uuid": "agent_unique_id",
  "car_uuid": "car_unique_id",
  "status": "Pending"
}
```

---

### **4️⃣ Update a Loan** (🔒 Requires Authentication)  
**Endpoint:** `PUT /{loan_uuid}`  
**Description:** Updates the details of a loan.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📥 Request Body:**  
```json
{
  "amount": 6000,
  "balance": 4500,
  "agent_uuid": "updated_agent_uuid",
  "car_uuid": "updated_car_uuid",
  "status": "Approved"
}
```

#### **📤 Response:**  
```json
{
  "message": "Loan updated successfully",
  "loan": {
    "_id": "loan_unique_id",
    "loan_uuid": "loan_unique_id",
    "user_uuid": "user_unique_id",
    "amount": 6000,
    "balance": 4500,
    "agent_uuid": "updated_agent_uuid",
    "car_uuid": "updated_car_uuid",
    "status": "Approved"
  }
}
```

---

### **5️⃣ Delete a Loan** (🔒 Requires Authentication)  
**Endpoint:** `DELETE /{loan_uuid}`  
**Description:** Deletes a specific loan by its UUID.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "message": "Loan deleted successfully"
}
```

---

## ⚠️ Error Responses  

| Status Code | Message                  | Description |
|-------------|--------------------------|-------------|
| 400         | `Bad request`             | The request was malformed or missing required data. |
| 401         | `Access denied`           | No token provided or invalid token. |
| 404         | `Loan not found`          | The loan with the specified UUID does not exist. |
| 500         | `Server error`            | Internal server error while processing the request. |

---

## 🚀 Usage Example (Postman or cURL)  

### **🔹 Create a New Loan**
```sh
curl -X POST http://your-api-domain.com/api/loans/ \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "loan_uuid": "loan_unique_id",
  "user_uuid": "user_unique_id",
  "amount": 5000,
  "agent_uuid": "agent_unique_id",
  "car_uuid": "car_unique_id",
  "status": "Pending"
}'
```

### **🔹 Get All Loans**
```sh
curl -X GET http://your-api-domain.com/api/loans/ \
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

# 📘 Momo and Payment API Documentation
---

## 📌 Base URL  
```
http://your-api-domain.com/api
```

---

## 🔑 Authentication  
- The API uses **JWT (JSON Web Token)** for authentication.  
- All endpoints (except the `register` and `login`) require a **Bearer Token** in the `Authorization` header.  
- Format:  
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```

---

## 📜 Endpoints  

### **1️⃣ Momo Account API**

#### **1.1 Create a New Momo Account**  
**Endpoint:** `POST /momo`  
**Description:** Creates a new momo account.  

##### **📥 Request Body:**  
```json
{
  "user_uuid": "user_unique_id",
  "vendor": "MomoVendor",
  "name": "John Doe",
  "phone": "1234567890",
  "momo_uuid": "momo_unique_id"
}
```

##### **📤 Response:**  
```json
{
  "message": "Momo account created successfully",
  "momo": {
    "_id": "momo_unique_id",
    "user_uuid": "user_unique_id",
    "vendor": "MomoVendor",
    "name": "John Doe",
    "phone": "1234567890",
    "momo_uuid": "momo_unique_id"
  }
}
```

---

#### **1.2 Get All Momo Accounts** (🔒 Requires Authentication)  
**Endpoint:** `GET /momo`  
**Description:** Retrieves all momo accounts.  

##### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

##### **📤 Response:**  
```json
[
  {
    "_id": "momo_unique_id",
    "user_uuid": "user_unique_id",
    "vendor": "MomoVendor",
    "name": "John Doe",
    "phone": "1234567890",
    "momo_uuid": "momo_unique_id"
  },
  {
    "_id": "momo_unique_id_2",
    "user_uuid": "user_unique_id_2",
    "vendor": "AnotherVendor",
    "name": "Jane Doe",
    "phone": "0987654321",
    "momo_uuid": "momo_unique_id_2"
  }
]
```

---

#### **1.3 Get a Specific Momo Account by UUID** (🔒 Requires Authentication)  
**Endpoint:** `GET /momo/{momo_uuid}`  
**Description:** Retrieves a specific momo account by its UUID.  

##### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

##### **📤 Response:**  
```json
{
  "_id": "momo_unique_id",
  "user_uuid": "user_unique_id",
  "vendor": "MomoVendor",
  "name": "John Doe",
  "phone": "1234567890",
  "momo_uuid": "momo_unique_id"
}
```

---

#### **1.4 Update a Momo Account** (🔒 Requires Authentication)  
**Endpoint:** `PUT /momo/{momo_uuid}`  
**Description:** Updates the details of a momo account.  

##### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

##### **📥 Request Body:**  
```json
{
  "vendor": "UpdatedVendor",
  "name": "John Doe Updated",
  "phone": "1234567890"
}
```

##### **📤 Response:**  
```json
{
  "message": "Momo account updated successfully",
  "momo": {
    "_id": "momo_unique_id",
    "user_uuid": "user_unique_id",
    "vendor": "UpdatedVendor",
    "name": "John Doe Updated",
    "phone": "1234567890",
    "momo_uuid": "momo_unique_id"
  }
}
```

---

#### **1.5 Delete a Momo Account** (🔒 Requires Authentication)  
**Endpoint:** `DELETE /momo/{momo_uuid}`  
**Description:** Deletes a specific momo account by its UUID.  

##### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

##### **📤 Response:**  
```json
{
  "message": "Momo account deleted successfully"
}
```

---

### **2️⃣ Payment API**

#### **2.1 Create a New Payment** (🔒 Requires Authentication)  
**Endpoint:** `POST /payment`  
**Description:** Creates a new payment.  

##### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

##### **📥 Request Body:**  
```json
{
  "loan_uuid": "loan_unique_id",
  "amount": 500,
  "payment_uuid": "payment_unique_id"
}
```

##### **📤 Response:**  
```json
{
  "message": "Payment created successfully",
  "payment": {
    "_id": "payment_unique_id",
    "loan_uuid": "loan_unique_id",
    "amount": 500,
    "payment_uuid": "payment_unique_id"
  }
}
```

---

#### **2.2 Get All Payments** (🔒 Requires Authentication)  
**Endpoint:** `GET /payment`  
**Description:** Retrieves all payments.  

##### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

##### **📤 Response:**  
```json
[
  {
    "_id": "payment_unique_id",
    "loan_uuid": "loan_unique_id",
    "amount": 500,
    "payment_uuid": "payment_unique_id"
  },
  {
    "_id": "payment_unique_id_2",
    "loan_uuid": "loan_unique_id_2",
    "amount": 300,
    "payment_uuid": "payment_unique_id_2"
  }
]
```

---

#### **2.3 Get a Payment by UUID** (🔒 Requires Authentication)  
**Endpoint:** `GET /payment/{payment_uuid}`  
**Description:** Retrieves a specific payment by its UUID.  

##### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

##### **📤 Response:**  
```json
{
  "_id": "payment_unique_id",
  "loan_uuid": "loan_unique_id",
  "amount": 500,
  "payment_uuid": "payment_unique_id"
}
```

---

#### **2.4 Update a Payment** (🔒 Requires Authentication)  
**Endpoint:** `PUT /payment/{payment_uuid}`  
**Description:** Updates the details of a payment.  

##### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

##### **📥 Request Body:**  
```json
{
  "amount": 600
}
```

##### **📤 Response:**  
```json
{
  "message": "Payment updated successfully",
  "payment": {
    "_id": "payment_unique_id",
    "loan_uuid": "loan_unique_id",
    "amount": 600,
    "payment_uuid": "payment_unique_id"
  }
}
```

---

#### **2.5 Delete a Payment** (🔒 Requires Authentication)  
**Endpoint:** `DELETE /payment/{payment_uuid}`  
**Description:** Deletes a specific payment by its UUID.  

##### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

##### **📤 Response:**  
```json
{
  "message": "Payment deleted successfully"
}
```

---

## ⚠️ Error Responses  

| Status Code | Message                  | Description |
|-------------|--------------------------|-------------|
| 400         | `Bad request`             | The request was malformed or missing required data. |
| 401         | `Access denied`           | No token provided or invalid token. |
| 404         | `Not found`               | The resource (Momo account or Payment) with the specified UUID does not exist. |
| 500         | `Server error`            | Internal server error while processing the request. |

---

## 🚀 Usage Example (Postman or cURL)  

### **🔹 Create a New Momo Account**
```sh
curl -X POST http://your-api-domain.com/api/momo \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "user_uuid": "user_unique_id",
  "vendor": "MomoVendor",
  "name": "John Doe",
  "phone": "1234567890",
  "momo_uuid": "momo_unique_id"
}'
```

### **🔹 Create a New Payment**
```sh
curl -X POST http://your-api-domain.com/api/payment \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "loan_uuid": "loan_unique_id",
  "amount": 500,
  "payment_uuid": "payment_unique_id"
}'
```

---

# 📘 Repayment Schedule API Documentation


## 📌 Base URL  
```
http://your-api-domain.com/api/repayment-schedules
```

---

## 🔑 Authentication  
- The API uses **JWT (JSON Web Token)** for authentication.  
- All endpoints (except the `register` and `login`) require a **Bearer Token** in the `Authorization` header.  
- Format:  
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```

---

## 📜 Endpoints  

### **1️⃣ Create a New Repayment Schedule**  
**Endpoint:** `POST /`  
**Description:** Creates a new repayment schedule.  

#### **📥 Request Body:**  
```json
{
  "repayment_schedule_uuid": "repayment_schedule_unique_id",
  "loan_uuid": "loan_unique_id",
  "due_date": "2025-12-25",
  "repayment_frequency": "Monthly",
  "total_amount_due": 1000,
  "status": "Pending"
}
```

#### **📤 Response:**  
```json
{
  "message": "Repayment schedule created successfully",
  "repaymentSchedule": {
    "_id": "repayment_schedule_unique_id",
    "loan_uuid": "loan_unique_id",
    "repayment_schedule_uuid": "repayment_schedule_unique_id",
    "due_date": "2025-12-25",
    "repayment_frequency": "Monthly",
    "total_amount_due": 1000,
    "status": "Pending"
  }
}
```

---

### **2️⃣ Get All Repayment Schedules** (🔒 Requires Authentication)  
**Endpoint:** `GET /`  
**Description:** Retrieves all repayment schedules.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
[
  {
    "_id": "repayment_schedule_unique_id",
    "loan_uuid": "loan_unique_id",
    "repayment_schedule_uuid": "repayment_schedule_unique_id",
    "due_date": "2025-12-25",
    "repayment_frequency": "Monthly",
    "total_amount_due": 1000,
    "status": "Pending"
  },
  {
    "_id": "repayment_schedule_unique_id_2",
    "loan_uuid": "loan_unique_id_2",
    "repayment_schedule_uuid": "repayment_schedule_unique_id_2",
    "due_date": "2025-10-10",
    "repayment_frequency": "Weekly",
    "total_amount_due": 500,
    "status": "Paid"
  }
]
```

---

### **3️⃣ Get a Specific Repayment Schedule by UUID** (🔒 Requires Authentication)  
**Endpoint:** `GET /{repayment_schedule_uuid}`  
**Description:** Retrieves a specific repayment schedule by its UUID.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "_id": "repayment_schedule_unique_id",
  "loan_uuid": "loan_unique_id",
  "repayment_schedule_uuid": "repayment_schedule_unique_id",
  "due_date": "2025-12-25",
  "repayment_frequency": "Monthly",
  "total_amount_due": 1000,
  "status": "Pending"
}
```

---

### **4️⃣ Update a Repayment Schedule** (🔒 Requires Authentication)  
**Endpoint:** `PUT /{repayment_schedule_uuid}`  
**Description:** Updates the details of a repayment schedule.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📥 Request Body:**  
```json
{
  "due_date": "2025-12-30",
  "repayment_frequency": "Bi-weekly",
  "total_amount_due": 1200,
  "status": "Pending"
}
```

#### **📤 Response:**  
```json
{
  "message": "Repayment schedule updated successfully",
  "repaymentSchedule": {
    "_id": "repayment_schedule_unique_id",
    "loan_uuid": "loan_unique_id",
    "repayment_schedule_uuid": "repayment_schedule_unique_id",
    "due_date": "2025-12-30",
    "repayment_frequency": "Bi-weekly",
    "total_amount_due": 1200,
    "status": "Pending"
  }
}
```

---

### **5️⃣ Delete a Repayment Schedule** (🔒 Requires Authentication)  
**Endpoint:** `DELETE /{repayment_schedule_uuid}`  
**Description:** Deletes a specific repayment schedule by its UUID.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "message": "Repayment schedule deleted successfully"
}
```

---

## ⚠️ Error Responses  

| Status Code | Message                  | Description |
|-------------|--------------------------|-------------|
| 400         | `Bad request`             | The request was malformed or missing required data. |
| 401         | `Access denied`           | No token provided or invalid token. |
| 404         | `Repayment schedule not found` | The repayment schedule with the specified UUID does not exist. |
| 500         | `Server error`            | Internal server error while processing the request. |


---

# 📘 Profile API Documentation

This documentation provides details about the **Profile API**, including authentication, endpoints, and request/response formats.

## 📌 Base URL  
```
http://your-api-domain.com/api/profiles
```

---

## 🔑 Authentication  
 
- Format:  
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```

---

## 📜 Endpoints  

### **1️⃣ Get All Profiles** (🔒 Requires Authentication)  
**Endpoint:** `GET /`  
**Description:** Retrieves all profiles.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
[
  {
    "profile_uuid": "profile_unique_id",
    "user_uuid": "user_unique_id",
    "fullname": "John Doe",
    "staff_id": "staff_001",
    "address": "123 Main St",
    "email": "johndoe@example.com",
    "category": "Admin",
    "id_image1": "url-to-id-image1",
    "id_image2": "url-to-id-image2",
    "personal_image": "url-to-personal-image"
  }
]
```

---

### **2️⃣ Get a Profile by Phone** (🔒 Requires Authentication)  
**Endpoint:** `GET /{phone}`  
**Description:** Retrieves a profile by the user's phone number.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "profile_uuid": "profile_unique_id",
  "user_uuid": "user_unique_id",
  "fullname": "John Doe",
  "staff_id": "staff_001",
  "address": "123 Main St",
  "email": "johndoe@example.com",
  "category": "Admin",
  "id_image1": "url-to-id-image1",
  "id_image2": "url-to-id-image2",
  "personal_image": "url-to-personal-image"
}
```

---

### **3️⃣ Create a New Profile** (🔒 Requires Authentication)  
**Endpoint:** `POST /`  
**Description:** Creates a new profile for a user.  

#### **📥 Request Body:**  
```json
{
  "phone": "1234567890",
  "profile_uuid": "profile_unique_id",
  "fullname": "John Doe",
  "staff_id": "staff_001",
  "address": "123 Main St",
  "email": "johndoe@example.com",
  "category": "Admin",
  "id_image1": "url-to-id-image1",
  "id_image2": "url-to-id-image2",
  "personal_image": "url-to-personal-image"
}
```

#### **📤 Response:**  
```json
{
  "profile_uuid": "profile_unique_id",
  "user_uuid": "user_unique_id",
  "fullname": "John Doe",
  "staff_id": "staff_001",
  "address": "123 Main St",
  "email": "johndoe@example.com",
  "category": "Admin",
  "id_image1": "url-to-id-image1",
  "id_image2": "url-to-id-image2",
  "personal_image": "url-to-personal-image"
}
```

---

### **4️⃣ Update a Profile** (🔒 Requires Authentication)  
**Endpoint:** `PUT /{phone}`  
**Description:** Updates the profile information of a user.  

#### **📥 Request Body:**  
```json
{
  "fullname": "John Doe Updated",
  "staff_id": "staff_001_updated",
  "address": "456 New St",
  "email": "newemail@example.com"
}
```

#### **📤 Response:**  
```json
{
  "profile_uuid": "profile_unique_id",
  "user_uuid": "user_unique_id",
  "fullname": "John Doe Updated",
  "staff_id": "staff_001_updated",
  "address": "456 New St",
  "email": "newemail@example.com",
  "category": "Admin",
  "id_image1

": "url-to-id-image1",
  "id_image2": "url-to-id-image2",
  "personal_image": "url-to-personal-image"
}
```

---

### **5️⃣ Delete a Profile** (🔒 Requires Authentication)  
**Endpoint:** `DELETE /{phone}`  
**Description:** Deletes a profile by phone number.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "message": "Profile deleted successfully"
}
```

---

## ⚠️ Error Responses  

| Status Code | Message                  | Description |
|-------------|--------------------------|-------------|
| 400         | `Bad request`             | The request was malformed or missing required data. |
| 401         | `Access denied`           | No token provided or invalid token. |
| 404         | `Profile not found`       | The profile with the specified phone number does not exist. |
| 500         | `Server error`            | Internal server error while processing the request. |


---

# 📘 Request API Documentation


## 📌 Base URL  
```
http://your-api-domain.com/api/requests
```

---

## 🔑 Authentication  
- The API uses **JWT (JSON Web Token)** for authentication.  
- All endpoints (except `register` and `login`) require a **Bearer Token** in the `Authorization` header.  
- Format:  
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```

---

## 📜 Endpoints  

### **1️⃣ Create a New Request**  
**Endpoint:** `POST /`  
**Description:** Creates a new request.  

#### **📥 Request Body:**  
```json
{
  "request_uuid": "unique-request-id",
  "user_uuid": "user-id",
  "amount": 1000,
  "station_uuid": "station-id",
  "car_uuid": "car-id",
  "agent_uuid": "agent-id",
  "status": "Pending"
}
```

#### **📤 Response:**  
```json
{
  "message": "Request created successfully",
  "request": {
    "request_uuid": "unique-request-id",
    "user_uuid": "user-id",
    "amount": 1000,
    "station_uuid": "station-id",
    "car_uuid": "car-id",
    "agent_uuid": "agent-id",
    "status": "Pending"
  }
}
```

---

### **2️⃣ Get All Requests** (🔒 Requires Authentication)  
**Endpoint:** `GET /`  
**Description:** Retrieves all requests.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
[
  {
    "request_uuid": "unique-request-id",
    "user_uuid": "user-id",
    "amount": 1000,
    "station_uuid": "station-id",
    "car_uuid": "car-id",
    "agent_uuid": "agent-id",
    "status": "Pending"
  },
  {
    "request_uuid": "another-request-id",
    "user_uuid": "user-id-2",
    "amount": 1500,
    "station_uuid": "station-id-2",
    "car_uuid": "car-id-2",
    "agent_uuid": "agent-id-2",
    "status": "Completed"
  }
]
```

---

### **3️⃣ Get a Request by UUID** (🔒 Requires Authentication)  
**Endpoint:** `GET /{request_uuid}`  
**Description:** Retrieves a specific request by its UUID.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "request_uuid": "unique-request-id",
  "user_uuid": "user-id",
  "amount": 1000,
  "station_uuid": "station-id",
  "car_uuid": "car-id",
  "agent_uuid": "agent-id",
  "status": "Pending"
}
```

---

### **4️⃣ Update a Request** (🔒 Requires Authentication)  
**Endpoint:** `PUT /{request_uuid}`  
**Description:** Updates the details of an existing request.  

#### **📥 Request Body:**  
```json
{
  "amount": 1200,
  "status": "Completed",
  "station_uuid": "station-id-2",
  "car_uuid": "car-id-2",
  "agent_uuid": "agent-id-2"
}
```

#### **📤 Response:**  
```json
{
  "message": "Request updated successfully",
  "request": {
    "request_uuid": "unique-request-id",
    "user_uuid": "user-id",
    "amount": 1200,
    "station_uuid": "station-id-2",
    "car_uuid": "car-id-2",
    "agent_uuid": "agent-id-2",
    "status": "Completed"
  }
}
```

---

### **5️⃣ Delete a Request** (🔒 Requires Authentication)  
**Endpoint:** `DELETE /{request_uuid}`  
**Description:** Deletes a specific request by its UUID.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "message": "Request deleted successfully"
}
```

---

## ⚠️ Error Responses  

| Status Code | Message                  | Description |
|-------------|--------------------------|-------------|
| 400         | `Bad request`             | The request was malformed or missing required data. |
| 401         | `Access denied`           | No token provided or invalid token. |
| 404         | `Request not found`       | The request with the specified UUID does not exist. |
| 500         | `Server error`            | Internal server error while processing the request. |

---

# 📘 Station API Documentation

This documentation outlines the **Station API**, including authentication, endpoints, request/response formats, and error handling.

## 📌 Base URL  
```
http://your-api-domain.com/api/stations
```

---

## 🔑 Authentication  
- The API uses **JWT (JSON Web Token)** for authentication.  
- All endpoints (except `register` and `login`) require a **Bearer Token** in the `Authorization` header.  
- Format:  
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```

---

## 📜 Endpoints  

### **1️⃣ Create a New Station**  
**Endpoint:** `POST /`  
**Description:** Creates a new station.  

#### **📥 Request Body:**  
```json
{
  "station_uuid": "station-id",
  "agent_uuid": "agent-id",
  "location": "Location 123",
  "bank_uuid": "bank-id"
}
```

#### **📤 Response:**  
```json
{
  "message": "Station created successfully",
  "station": {
    "station_uuid": "station-id",
    "agent_uuid": "agent-id",
    "location": "Location 123",
    "bank_uuid": "bank-id"
  }
}
```

---

### **2️⃣ Get All Stations** (🔒 Requires Authentication)  
**Endpoint:** `GET /`  
**Description:** Retrieves all stations.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
[
  {
    "station_uuid": "station-id",
    "agent_uuid": "agent-id",
    "location": "Location 123",
    "bank_uuid": "bank-id"
  },
  {
    "station_uuid": "station-id-2",
    "agent_uuid": "agent-id-2",
    "location": "Location 456",
    "bank_uuid": "bank-id-2"
  }
]
```

---

### **3️⃣ Get a Station by UUID** (🔒 Requires Authentication)  
**Endpoint:** `GET /{station_uuid}`  
**Description:** Retrieves a specific station by its UUID.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "station_uuid": "station-id",
  "agent_uuid": "agent-id",
  "location": "Location 123",
  "bank_uuid": "bank-id"
}
```

---

### **4️⃣ Update a Station** (🔒 Requires Authentication)  
**Endpoint:** `PUT /{station_uuid}`  
**Description:** Updates the details of an existing station.  

#### **📥 Request Body:**  
```json
{
  "location": "Updated Location",
  "bank_uuid": "updated-bank-id"
}
```

#### **📤 Response:**  
```json
{
  "message": "Station updated successfully",
  "station": {
    "station_uuid": "station-id",
    "agent_uuid": "agent-id",
    "location": "Updated Location",
    "bank_uuid": "updated-bank-id"
  }
}
```

---

### **5️⃣ Delete a Station** (🔒 Requires Authentication)  
**Endpoint:** `DELETE /{station_uuid}`  
**Description:** Deletes a specific station by its UUID.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "message": "Station deleted successfully"
}
```

---

## ⚠️ Error Responses  

| Status Code | Message                  | Description |
|-------------|--------------------------|-------------|
| 400         | `Bad request`             | The request was malformed or missing required data. |
| 401         | `Access denied`           | No token provided or invalid token. |
| 404         | `Station not found`       | The station with the specified UUID does not exist. |
| 500         | `Server error`            | Internal server error while processing the request. |


---

# 📘 Transaction API Documentation

This documentation outlines the **Transaction API**, including authentication, endpoints, request/response formats, and error handling.

## 📌 Base URL  
```
http://your-api-domain.com/api/transactions
```

---

## 🔑 Authentication  
- The API uses **JWT (JSON Web Token)** for authentication.  
- All endpoints (except `register` and `login`) require a **Bearer Token** in the `Authorization` header.  
- Format:  
  ```
  Authorization: Bearer YOUR_JWT_TOKEN
  ```

---

## 📜 Endpoints  

### **1️⃣ Create a New Transaction**  
**Endpoint:** `POST /`  
**Description:** Creates a new transaction.  

#### **📥 Request Body:**  
```json
{
  "user_uuid": "user-id",
  "loan_uuid": "loan-id",
  "transaction_uuid": "unique-transaction-id",
  "amount": 5000,
  "type": "credit"
}
```

#### **📤 Response:**  
```json
{
  "message": "Transaction created successfully",
  "transaction": {
    "user_uuid": "user-id",
    "loan_uuid": "loan-id",
    "transaction_uuid": "unique-transaction-id",
    "amount": 5000,
    "type": "credit"
  }
}
```

---

### **2️⃣ Get All Transactions** (🔒 Requires Authentication)  
**Endpoint:** `GET /`  
**Description:** Retrieves all transactions.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
[
  {
    "user_uuid": "user-id",
    "loan_uuid": "loan-id",
    "transaction_uuid": "unique-transaction-id",
    "amount": 5000,
    "type": "credit"
  },
  {
    "user_uuid": "user-id-2",
    "loan_uuid": "loan-id-2",
    "transaction_uuid": "unique-transaction-id-2",
    "amount": 3000,
    "type": "debit"
  }
]
```

---

### **3️⃣ Get a Transaction by UUID** (🔒 Requires Authentication)  
**Endpoint:** `GET /{transaction_uuid}`  
**Description:** Retrieves a specific transaction by its UUID.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "user_uuid": "user-id",
  "loan_uuid": "loan-id",
  "transaction_uuid": "unique-transaction-id",
  "amount": 5000,
  "type": "credit"
}
```

---

### **4️⃣ Update a Transaction** (🔒 Requires Authentication)  
**Endpoint:** `PUT /{transaction_uuid}`  
**Description:** Updates the details of an existing transaction.  

#### **📥 Request Body:**  
```json
{
  "amount": 5500,
  "type": "debit"
}
```

#### **📤 Response:**  
```json
{
  "message": "Transaction updated successfully",
  "transaction": {
    "user_uuid": "user-id",
    "loan_uuid": "loan-id",
    "transaction_uuid": "unique-transaction-id",
    "amount": 5500,
    "type": "debit"
  }
}
```

---

### **5️⃣ Delete a Transaction** (🔒 Requires Authentication)  
**Endpoint:** `DELETE /{transaction_uuid}`  
**Description:** Deletes a specific transaction by its UUID.  

#### **📥 Headers:**  
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **📤 Response:**  
```json
{
  "message": "Transaction deleted successfully"
}
```

---

## ⚠️ Error Responses  

| Status Code | Message                  | Description |
|-------------|--------------------------|-------------|
| 400         | `Bad request`             | The request was malformed or missing required data. |
| 401         | `Access denied`           | No token provided or invalid token. |
| 404         | `Transaction not found`   | The transaction with the specified UUID does not exist. |
| 500         | `Server error`            | Internal server error while processing the request. |

---

