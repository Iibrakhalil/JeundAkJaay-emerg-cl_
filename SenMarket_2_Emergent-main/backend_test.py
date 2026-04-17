#!/usr/bin/env python3
"""
Jënd-Ak-Jaay Backend API Testing Suite
Tests all major API endpoints including authentication, products, services, image upload, and admin functionality.
Focus on app renaming and image upload flow testing.
"""

import requests
import sys
import json
import io
from datetime import datetime
from typing import Dict, Any, Optional

class JendAkJaayAPITester:
    def __init__(self, base_url: str = "https://quality-review-8.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.demo_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Test credentials
        self.admin_creds = {"email": "admin@senmarket.sn", "password": "SenMarket2024!"}
        self.demo_creds = {"email": "mamadou@test.com", "password": "password123"}
        
        print(f"🚀 Starting Jënd-Ak-Jaay API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict] = None, token: Optional[str] = None, 
                 params: Optional[Dict] = None) -> tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Test {self.tests_run}: {name}")
        print(f"   {method} {endpoint}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"   ✅ PASSED - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"   ❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   📝 Response: {error_detail}")
                except:
                    print(f"   📝 Response: {response.text[:200]}")
                
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "error": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"   ❌ FAILED - Exception: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test API health endpoint and verify app name"""
        print("\n🏥 HEALTH CHECK & APP NAME VERIFICATION")
        success, response = self.run_test("API Health Check", "GET", "/", 200)
        if success and response.get("message"):
            print(f"   📊 API Message: {response['message']}")
            # Check if the response contains Jënd-Ak-Jaay instead of SenMarket
            if "Jënd-Ak-Jaay" in response["message"]:
                print("   ✅ App name correctly updated to Jënd-Ak-Jaay")
            else:
                print("   ⚠️ App name may not be fully updated in API response")
        return success

    def test_admin_login(self):
        """Test admin login"""
        print("\n👑 ADMIN AUTHENTICATION")
        success, response = self.run_test(
            "Admin Login", 
            "POST", 
            "/auth/login", 
            200, 
            data=self.admin_creds
        )
        
        if success and response.get("access_token"):
            self.admin_token = response["access_token"]
            user = response.get("user", {})
            print(f"   👤 Admin User: {user.get('firstName', '')} {user.get('lastName', '')}")
            print(f"   🔑 Admin Status: {user.get('isAdmin', False)}")
            return True
        return False

    def test_demo_login(self):
        """Test demo user login"""
        print("\n👤 DEMO USER AUTHENTICATION")
        success, response = self.run_test(
            "Demo User Login", 
            "POST", 
            "/auth/login", 
            200, 
            data=self.demo_creds
        )
        
        if success and response.get("access_token"):
            self.demo_token = response["access_token"]
            user = response.get("user", {})
            print(f"   👤 Demo User: {user.get('firstName', '')} {user.get('lastName', '')}")
            return True
        return False

    def test_brute_force_protection(self):
        """Test brute force protection"""
        print("\n🛡️ BRUTE FORCE PROTECTION")
        
        # Try 5 failed login attempts
        bad_creds = {"email": "test@brute.com", "password": "wrongpassword"}
        
        for i in range(6):  # Try 6 times to trigger protection
            success, response = self.run_test(
                f"Brute Force Attempt {i+1}", 
                "POST", 
                "/auth/login", 
                429 if i >= 5 else 401,  # Expect 429 on 6th attempt
                data=bad_creds
            )
            
            if i >= 5 and success:
                print("   🛡️ Brute force protection is working!")
                return True
            elif i < 5 and not success and "429" not in str(response):
                continue  # Expected failure for first 5 attempts
        
        return False

    def test_user_registration(self):
        """Test user registration"""
        print("\n📝 USER REGISTRATION")
        
        # Generate unique email for testing
        timestamp = datetime.now().strftime("%H%M%S")
        test_user = {
            "email": f"testuser{timestamp}@example.com",
            "password": "TestPassword123!",
            "firstName": "Test",
            "lastName": "User",
            "phone": "+221771234567",
            "location": "Dakar"
        }
        
        success, response = self.run_test(
            "User Registration", 
            "POST", 
            "/auth/signup", 
            200, 
            data=test_user
        )
        
        if success and response.get("access_token"):
            print(f"   ✅ New user registered successfully")
            return True
        return False

    def test_products_api(self):
        """Test products API endpoints"""
        print("\n🛍️ PRODUCTS API")
        
        # Get all products
        success, products = self.run_test("Get All Products", "GET", "/products/", 200)
        if not success:
            return False
            
        print(f"   📦 Found {len(products)} products")
        
        # Test product detail if products exist
        if products and len(products) > 0:
            product_id = products[0].get("id")
            if product_id:
                success, product = self.run_test(
                    "Get Product Detail", 
                    "GET", 
                    f"/products/{product_id}", 
                    200
                )
                if success:
                    print(f"   📋 Product: {product.get('title', 'Unknown')}")
                    return True
        
        return success

    def test_services_api(self):
        """Test services API endpoints"""
        print("\n🔧 SERVICES API")
        
        # Get all services
        success, services = self.run_test("Get All Services", "GET", "/services/", 200)
        if not success:
            return False
            
        print(f"   🛠️ Found {len(services)} services")
        
        # Test service detail if services exist
        if services and len(services) > 0:
            service_id = services[0].get("id")
            if service_id:
                success, service = self.run_test(
                    "Get Service Detail", 
                    "GET", 
                    f"/services/{service_id}", 
                    200
                )
                if success:
                    print(f"   📋 Service: {service.get('title', 'Unknown')}")
                    return True
        
        return success

    def test_protected_endpoints(self):
        """Test protected endpoints that require authentication"""
        print("\n🔒 PROTECTED ENDPOINTS")
        
        if not self.demo_token:
            print("   ❌ No demo token available for protected endpoint testing")
            return False
        
        # Test user profile
        success, profile = self.run_test(
            "Get User Profile", 
            "GET", 
            "/auth/me", 
            200, 
            token=self.demo_token
        )
        
        if success:
            print(f"   👤 Profile: {profile.get('firstName', '')} {profile.get('lastName', '')}")
        
        return success

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        print("\n👑 ADMIN ENDPOINTS")
        
        if not self.admin_token:
            print("   ❌ No admin token available for admin endpoint testing")
            return False
        
        # Test admin stats (if endpoint exists)
        success, stats = self.run_test(
            "Get Admin Stats", 
            "GET", 
            "/admin/stats", 
            200, 
            token=self.admin_token
        )
        
        return success

    def test_image_upload_flow(self):
        """Test complete image upload and retrieval flow"""
        print("\n📸 IMAGE UPLOAD FLOW")
        
        if not self.demo_token:
            print("   ❌ No demo token available for upload testing")
            return False
        
        # Create a simple test image (1x1 pixel PNG)
        test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
        
        # Test image upload
        url = f"{self.base_url}/upload/image"
        headers = {'Authorization': f'Bearer {self.demo_token}'}
        files = {'file': ('test.png', test_image_data, 'image/png')}
        
        self.tests_run += 1
        print(f"\n🔍 Test {self.tests_run}: Image Upload")
        print(f"   POST /upload/image")
        
        try:
            response = requests.post(url, headers=headers, files=files, timeout=10)
            
            if response.status_code == 200:
                self.tests_passed += 1
                print(f"   ✅ PASSED - Status: {response.status_code}")
                
                upload_response = response.json()
                image_url = upload_response.get("url")
                
                if image_url and image_url.startswith("/api/media/"):
                    print(f"   📸 Upload URL: {image_url}")
                    
                    # Test image retrieval
                    media_id = image_url.split("/api/media/")[-1]
                    success, _ = self.run_test(
                        "Image Retrieval", 
                        "GET", 
                        f"/media/{media_id}", 
                        200
                    )
                    
                    if success:
                        print("   ✅ Complete upload-to-display flow working")
                        return True
                    else:
                        print("   ❌ Image retrieval failed")
                        return False
                else:
                    print(f"   ❌ Invalid upload response format: {upload_response}")
                    return False
            else:
                print(f"   ❌ FAILED - Expected 200, got {response.status_code}")
                print(f"   📝 Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": "Image Upload",
                    "endpoint": "/upload/image",
                    "expected": 200,
                    "actual": response.status_code,
                    "error": response.text[:200]
                })
                return False
                
        except Exception as e:
            print(f"   ❌ FAILED - Exception: {str(e)}")
            self.failed_tests.append({
                "test": "Image Upload",
                "endpoint": "/upload/image",
                "error": str(e)
            })
            return False

    def test_product_creation_with_image(self):
        """Test creating a product with uploaded image"""
        print("\n🛍️ PRODUCT CREATION WITH IMAGE")
        
        if not self.demo_token:
            print("   ❌ No demo token available for product creation testing")
            return False
        
        # First upload an image
        test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
        
        url = f"{self.base_url}/upload/image"
        headers = {'Authorization': f'Bearer {self.demo_token}'}
        files = {'file': ('test_product.png', test_image_data, 'image/png')}
        
        try:
            upload_response = requests.post(url, headers=headers, files=files, timeout=10)
            if upload_response.status_code != 200:
                print("   ❌ Image upload failed for product creation test")
                return False
            
            image_url = upload_response.json().get("url")
            
            # Create product with uploaded image
            timestamp = datetime.now().strftime("%H%M%S")
            product_data = {
                "title": f"Test Product {timestamp}",
                "titleWo": f"Test Product Wolof {timestamp}",
                "price": 15000,
                "category": "electronics",
                "condition": "new",
                "location": "Dakar",
                "description": "Test product with uploaded image",
                "descriptionWo": "Test product ak uploaded image",
                "images": [image_url]
            }
            
            success, response = self.run_test(
                "Create Product with Image", 
                "POST", 
                "/products/", 
                200, 
                data=product_data,
                token=self.demo_token
            )
            
            if success:
                print(f"   ✅ Product created with uploaded image")
                return True
            else:
                print(f"   ❌ Product creation failed")
                return False
                
        except Exception as e:
            print(f"   ❌ FAILED - Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all test suites"""
        print("🧪 STARTING COMPREHENSIVE API TESTING")
        print("=" * 60)
        
        # Core functionality tests
        test_results = []
        
        # 1. Health check
        test_results.append(("Health Check", self.test_health_check()))
        
        # 2. Authentication tests
        test_results.append(("Admin Login", self.test_admin_login()))
        test_results.append(("Demo Login", self.test_demo_login()))
        test_results.append(("User Registration", self.test_user_registration()))
        
        # 3. Security tests
        test_results.append(("Brute Force Protection", self.test_brute_force_protection()))
        
        # 4. Core API tests
        test_results.append(("Products API", self.test_products_api()))
        test_results.append(("Services API", self.test_services_api()))
        
        # 5. Protected endpoints
        test_results.append(("Protected Endpoints", self.test_protected_endpoints()))
        test_results.append(("Admin Endpoints", self.test_admin_endpoints()))
        
        # 6. Image upload and product creation tests
        test_results.append(("Image Upload Flow", self.test_image_upload_flow()))
        test_results.append(("Product Creation with Image", self.test_product_creation_with_image()))
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        for test_name, result in test_results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} {test_name}")
        
        print(f"\n📈 Overall: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS ({len(self.failed_tests)}):")
            for i, failure in enumerate(self.failed_tests, 1):
                print(f"{i}. {failure['test']}")
                print(f"   Endpoint: {failure['endpoint']}")
                if 'expected' in failure:
                    print(f"   Expected: {failure['expected']}, Got: {failure['actual']}")
                print(f"   Error: {failure['error']}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"\n🎯 Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 80  # Consider 80%+ success rate as passing

def main():
    """Main test execution"""
    tester = JendAkJaayAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Test suite failed with error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())