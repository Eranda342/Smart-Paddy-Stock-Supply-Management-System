const openapi = {
  openapi: "3.0.3",
  info: {
    title: "AgroBridge API",
    version: "1.0.0",
    description: "Backend API for the Smart Paddy Stock & Supply Management System."
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local development server"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  paths: {
    "/": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "API is running"
          }
        }
      }
    },

    "/api/users/register": {
      post: {
        summary: "Register a user",
        description: "Uploads a verification document and creates a new user.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {}
          }
        },
        responses: {
          "201": { description: "User registered" }
        }
      }
    },
    "/api/users/login": {
      post: {
        summary: "Login",
        responses: {
          "200": { description: "Login successful" }
        }
      }
    },
    "/api/users/me": {
      get: {
        summary: "Get my profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Profile returned" }
        }
      },
      put: {
        summary: "Update my profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Profile updated" }
        }
      }
    },
    "/api/users/me/avatar": {
      post: {
        summary: "Upload avatar",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {}
          }
        },
        responses: {
          "200": { description: "Avatar uploaded" }
        }
      }
    },

    "/api/auth/register": {
      post: {
        summary: "Register a user (alias)",
        description: "Alias for /api/users/register.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {}
          }
        },
        responses: {
          "201": { description: "User registered" }
        }
      }
    },
    "/api/auth/login": {
      post: {
        summary: "Login (alias)",
        responses: {
          "200": { description: "Login successful" }
        }
      }
    },

    "/api/listings": {
      post: {
        summary: "Create listing",
        description: "Farmer SELL or Mill Owner BUY listing.",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Listing created" }
        }
      }
    },
    "/api/listings/my": {
      get: {
        summary: "Get my listings",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Listings returned" }
        }
      }
    },
    "/api/listings/marketplace": {
      get: {
        summary: "Marketplace listings (SELL)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Listings returned" }
        }
      }
    },
    "/api/listings/buy-listings": {
      get: {
        summary: "Buy listings (BUY)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Listings returned" }
        }
      }
    },
    "/api/listings/{id}": {
      get: {
        summary: "Get listing by id",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Listing returned" }
        }
      },
      put: {
        summary: "Update listing",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Listing updated" }
        }
      },
      delete: {
        summary: "Delete listing",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Listing deleted" }
        }
      }
    },

    "/api/negotiations": {
      post: {
        summary: "Create negotiation",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Negotiation created" }
        }
      },
      get: {
        summary: "Get my negotiations",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Negotiations returned" }
        }
      }
    },
    "/api/negotiations/{id}": {
      get: {
        summary: "Get negotiation by id",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Negotiation returned" }
        }
      }
    },
    "/api/negotiations/{id}/message": {
      post: {
        summary: "Add negotiation message",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Message added" }
        }
      }
    },
    "/api/negotiations/{id}/accept": {
      put: {
        summary: "Accept negotiation",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Negotiation accepted" }
        }
      }
    },
    "/api/negotiations/{id}/reject": {
      put: {
        summary: "Reject negotiation",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Negotiation rejected" }
        }
      }
    },
    "/api/negotiations/{id}/status": {
      put: {
        summary: "Update negotiation status",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Status updated" }
        }
      }
    },
    "/api/negotiations/{id}/read": {
      put: {
        summary: "Mark negotiation messages read",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Messages marked read" }
        }
      }
    },
    "/api/negotiations/{id}/message/{messageId}": {
      delete: {
        summary: "Delete negotiation message",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "messageId", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": { description: "Message deleted" }
        }
      },
      put: {
        summary: "Edit negotiation message",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "messageId", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": { description: "Message edited" }
        }
      }
    },

    "/api/transactions": {
      get: {
        summary: "Get my transactions",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Transactions returned" }
        }
      }
    },
    "/api/transactions/{id}": {
      get: {
        summary: "Get transaction by id",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Transaction returned" }
        }
      }
    },
    "/api/transactions/{id}/pay": {
      put: {
        summary: "Mark transaction paid",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Payment recorded" }
        }
      }
    },
    "/api/transactions/{id}/transport-decision": {
      put: {
        summary: "Set transport decision",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Decision recorded" }
        }
      }
    },
    "/api/transactions/{id}/assign-vehicle": {
      put: {
        summary: "Assign vehicle",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Vehicle assigned" }
        }
      }
    },
    "/api/transactions/{id}/pickup": {
      put: {
        summary: "Confirm pickup",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Pickup confirmed" }
        }
      }
    },
    "/api/transactions/{id}/deliver": {
      put: {
        summary: "Mark delivered",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Delivery recorded" }
        }
      }
    },
    "/api/transactions/{id}/farmer-delivered": {
      put: {
        summary: "Farmer self-delivery",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Delivery recorded" }
        }
      }
    },
    "/api/transactions/{id}/confirm-delivery": {
      put: {
        summary: "Mill owner confirms delivery",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Delivery confirmed" }
        }
      }
    },

    "/api/transports": {
      get: {
        summary: "Get transport records",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Transport returned" }
        }
      },
      post: {
        summary: "Create transport",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Transport created" }
        }
      }
    },

    "/api/vehicles": {
      get: {
        summary: "Get vehicles",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Vehicles returned" }
        }
      },
      post: {
        summary: "Add vehicle",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Vehicle added" }
        }
      }
    },
    "/api/vehicles/{id}": {
      put: {
        summary: "Update vehicle",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Vehicle updated" }
        }
      },
      delete: {
        summary: "Delete vehicle",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Vehicle deleted" }
        }
      }
    },

    "/api/admin/create-admin": {
      post: {
        summary: "Create admin",
        description: "Requires admin secret or existing admin token.",
        responses: {
          "201": { description: "Admin created" }
        }
      }
    },
    "/api/admin/stats": {
      get: {
        summary: "Get platform stats",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Stats returned" }
        }
      }
    },
    "/api/admin/users": {
      get: {
        summary: "Get all users",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Users returned" }
        }
      }
    },
    "/api/admin/users/{id}": {
      delete: {
        summary: "Delete user",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "User deleted" }
        }
      }
    },
    "/api/admin/unverified-users": {
      get: {
        summary: "Get unverified users",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Users returned" }
        }
      }
    },
    "/api/admin/verify-user": {
      post: {
        summary: "Verify user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "User verified" }
        }
      }
    },
    "/api/admin/users/{id}/block": {
      put: {
        summary: "Block user",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "User blocked" }
        }
      }
    },
    "/api/admin/users/{id}/unblock": {
      put: {
        summary: "Unblock user",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "User unblocked" }
        }
      }
    },
    "/api/admin/users/{id}/approve": {
      put: {
        summary: "Approve user verification",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "User approved" }
        }
      }
    },
    "/api/admin/users/{id}/reject": {
      put: {
        summary: "Reject user verification",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "User rejected" }
        }
      }
    },
    "/api/admin/listings": {
      get: {
        summary: "Get all listings",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Listings returned" }
        }
      }
    },
    "/api/admin/listings/{id}": {
      delete: {
        summary: "Admin delete listing",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Listing deleted" }
        }
      }
    },
    "/api/admin/negotiations": {
      get: {
        summary: "Get all negotiations",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Negotiations returned" }
        }
      }
    },
    "/api/admin/transactions": {
      get: {
        summary: "Get all transactions",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Transactions returned" }
        }
      }
    },
    "/api/admin/transport": {
      get: {
        summary: "Get all transport records",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Transport returned" }
        }
      }
    },
    "/api/admin/dashboard": {
      get: {
        summary: "Get admin dashboard stats",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Dashboard returned" }
        }
      }
    },
    "/api/admin/verifications": {
      get: {
        summary: "Get pending verifications",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Verifications returned" }
        }
      }
    },
    "/api/admin/verifications/{id}/approve": {
      put: {
        summary: "Approve verification",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Verification approved" }
        }
      }
    },
    "/api/admin/verifications/{id}/reject": {
      put: {
        summary: "Reject verification",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Verification rejected" }
        }
      }
    },

    "/api/notifications": {
      get: {
        summary: "Get notifications",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Notifications returned" }
        }
      }
    },
    "/api/notifications/{id}/read": {
      put: {
        summary: "Mark notification read",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Notification updated" }
        }
      }
    },

    "/api/dashboard/farmer": {
      get: {
        summary: "Get farmer dashboard",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Dashboard returned" }
        }
      }
    },
    "/api/dashboard/millOwner": {
      get: {
        summary: "Get mill owner dashboard",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Dashboard returned" }
        }
      }
    },

    "/api/analytics/monthly-sales": {
      get: {
        summary: "Get monthly sales analytics",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Analytics returned" }
        }
      }
    }
  }
};

module.exports = openapi;
