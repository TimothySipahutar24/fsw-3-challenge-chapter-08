const AuthenticationController = require("../AuthenticationController");
const { User, Role } = require("../../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  EmailNotRegisteredError,
  InsufficientAccessError,
} = require("../../errors");

describe("AuthenticationController", () => {
  describe("#constructor", () => {
    it("should make an authenticationController object with setted parameters", () => {
      const userModel = {};
      const roleModel = {};
      const bcrypt = {};
      const jwt = {};
      const authenticationController = new AuthenticationController({
        userModel,
        roleModel,
        bcrypt,
        jwt,
      });

      expect(authenticationController.userModel).toBe(userModel);
      expect(authenticationController.roleModel).toBe(roleModel);
      expect(authenticationController.bcrypt).toBe(bcrypt);
      expect(authenticationController.jwt).toBe(jwt);
    });
  });

  describe("#authorize", () => {
    it("should run the next() function", async () => {
      const userModel = User;
      const roleModel = Role;
      const authController = new AuthenticationController({
        userModel,
        roleModel,
        bcrypt,
        jwt,
      });

      const mockUser = {
        id: 1,
        name: "test",
        email: "tes@mail.com",
        password: "test123",
        image: "test.png",
        roleId: 1,
      };

      const mockRole = {
        id: 1,
        name: "CUSTOMER",
      };

      const mockToken = authController.createTokenFromUser(mockUser, mockRole);

      const mockRequest = {
        headers: {
          authorization: "Bearer " + mockToken,
        },
      };

      const mockResponse = {};

      const mockNext = jest.fn();

      const auth = authController.authorize("CUSTOMER");
      auth(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should call res.status(401) with insufficient access error", async () => {
      const userModel = User;
      const roleModel = Role;
      const authController = new AuthenticationController({
        userModel,
        roleModel,
        bcrypt,
        jwt,
      });

      const mockUser = {
        id: 1,
        name: "test",
        email: "tes@mail.com",
        password: "test123",
        image: "test.png",
        roleId: 1,
      };

      const mockRole = {
        id: 1,
        name: "CUSTOMER",
      };

      const mockToken = authController.createTokenFromUser(mockUser, mockRole);

      const mockRequest = {
        headers: {
          authorization: "Bearer " + mockToken,
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockNext = jest.fn();

      const auth = authController.authorize("ADMIN");
      auth(mockRequest, mockResponse, mockNext);

      const err = new InsufficientAccessError("CUSTOMER");

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          name: err.name,
          message: err.message,
          details: err.details || null,
        },
      });
    });
  });

  describe("#handleLogin", () => {
    it("should call res.status(201) and return access token", async () => {
      const email = "test@mail.com";
      const password = "test123";
      const encryptedPassword = bcrypt.hashSync("test123", 10);

      const mockRequest = {
        body: {
          email,
          password,
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockNext = jest.fn();

      const mockUser = {
        id: 1,
        name: "test",
        email: "test@mail.com",
        encryptedPassword: encryptedPassword,
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRole = {
        id: 1,
        name: "CUSTOMER",
      };

      const mockUserModel = {
        findOne: jest.fn().mockReturnValue({
          ...mockUser,
          Role: mockRole,
        }),
      };

      const mockRoleModel = {
        findOne: jest.fn().mockReturnValue(mockRole),
      };

      const authController = new AuthenticationController({
        userModel: mockUserModel,
        roleModel: mockRoleModel,
        bcrypt,
        jwt,
      });
      await authController.handleLogin(mockRequest, mockResponse, mockNext);
      const accessToken = authController.createTokenFromUser(
        {
          ...mockUser,
          Role: mockRole,
        },
        mockRole
      );

      expect(mockUserModel.findOne).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        accessToken: accessToken,
      });
    });

    it("should call res.status(404) and res.json with email not registered error", async () => {
      const email = "unregistered@mail.com";
      const password = "test123";

      const mockRequest = {
        body: {
          email,
          password,
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockNext = jest.fn();

      const mockUserModel = {
        findOne: jest.fn().mockReturnValue(null),
      };

      const mockRole = {
        id: 1,
        name: "CUSTOMER",
      };

      const mockRoleModel = {
        findOne: jest.fn().mockReturnValue(mockRole),
      };

      const authController = new AuthenticationController({
        userModel: mockUserModel,
        roleModel: mockRoleModel,
        bcrypt,
        jwt,
      });
      await authController.handleLogin(mockRequest, mockResponse, mockNext);

      const err = new EmailNotRegisteredError(email);

      expect(mockUserModel.findOne).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(err);
    });
  });

  describe("#handleRegister", () => {
    it("should call res.status(201) and res.json with access token", async () => {
      const name = "test";
      const email = "test@mail.com";
      const password = "test123";
      const encryptedPassword = bcrypt.hashSync("test123", 10);

      const mockRequest = {
        body: {
          name,
          email,
          password,
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockNext = jest.fn();

      const mockUser = {
        id: 1,
        name: "test",
        email: "test@mail.com",
        encryptedPassword: encryptedPassword,
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUserModel = {
        findOne: jest.fn().mockReturnValue(null),
        create: jest.fn().mockReturnValue(mockUser),
      };

      const mockRole = {
        id: 1,
        name: "CUSTOMER",
      };

      const mockRoleModel = {
        findOne: jest.fn().mockReturnValue(mockRole),
      };

      const authController = new AuthenticationController({
        userModel: mockUserModel,
        roleModel: mockRoleModel,
        bcrypt,
        jwt,
      });
      await authController.handleRegister(mockRequest, mockResponse, mockNext);

      const accessToken = authController.createTokenFromUser(
        mockUser,
        mockRole
      );

      expect(mockUserModel.findOne).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        accessToken: accessToken,
      });
    });

    it("should run the next function", async () => {
      const err = new Error("something");
      const name = "user";
      const email = "user@gmail.com";
      const password = "user123";

      const mockRequest = {
        body: {
          name,
          email,
          password,
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockNext = jest.fn();

      const mockUserModel = {
        findOne: jest.fn().mockRejectedValue(err),
      };

      const mockRole = {
        id: 1,
        name: "CUSTOMER",
      };

      const mockRoleModel = {
        findOne: jest.fn().mockReturnValue(mockRole),
      };

      const authController = new AuthenticationController({
        userModel: mockUserModel,
        roleModel: mockRoleModel,
      });
      await authController.handleRegister(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("#handleGetUser", () => {
    it("should return res.status(200) and res.json with user data", async () => {
      const email = "user@mail.com";

      const mockRequest = {
        user: {
          id: 1,
          roleId: 1,
        },
      };

      const mockUser = new User({ email });
      const mockUserModel = {
        findByPk: jest.fn().mockReturnValue(mockUser),
      };

      const mockRole = new Role();
      const mockRoleModel = {
        findByPk: jest.fn().mockReturnValue(mockRole),
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const authController = new AuthenticationController({
        userModel: mockUserModel,
        roleModel: mockRoleModel,
      });
      await authController.handleGetUser(mockRequest, mockResponse);

      expect(mockUserModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });
  });
});
