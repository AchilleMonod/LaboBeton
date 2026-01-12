const {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany
} = require('../controllers/companyController');
const Company = require('../models/Company');
const mongoose = require('mongoose');

jest.mock('../models/Company');

describe('Company Controller', () => {
  let req;
  let res;
  let statusMock;
  let jsonMock;
  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    res = { status: statusMock, json: jsonMock };
    Company.find.mockReset();
    Company.findOne.mockReset();
    Company.findOneAndDelete.mockReset();
  });

  describe('getCompanies', () => {
    it('should return 400 if user id is invalid', async () => {
      req = { user: { id: 'invalidUserId' } };
      await getCompanies(req, res);
    expect(statusMock).toHaveBeenCalledWith(400);
  });

    it('should return companies for valid user id', async () => {
      const mockCompanies = [
        { name: 'Company 1', userId: new mongoose.Types.ObjectId() },
        { name: 'Company 2', userId: new mongoose.Types.ObjectId() }
      ];
      req = { user: { id: new mongoose.Types.ObjectId().toString() } };
      Company.find.mockResolvedValue(mockCompanies);
      await getCompanies(req, res);
      expect(jsonMock).toHaveBeenCalledWith(mockCompanies);
  });
  });

  describe('createCompany', () => {
    it('should return 400 if user id is invalid', async () => {
      req = { user: { id: 'invalidUserId' }, body: {} };
      await createCompany(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
  });

    it('should create a company with valid data', async () => {
    const mockCompany = {
        name: 'New Company',
        contactName: 'John Doe',
        email: 'john@example.com',
      phone: '1234567890',
      save: jest.fn().mockResolvedValue({
          name: 'New Company',
          contactName: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890'
      })
    };
    
    req = {
      user: { id: new mongoose.Types.ObjectId().toString() },
      body: {
          name: 'New Company',
          contactName: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890'
      }
    };
    
      Company.mockImplementation(() => mockCompany);
      await createCompany(req, res);
    expect(jsonMock).toHaveBeenCalledWith({
        name: 'New Company',
        contactName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890'
    });
  });
});

  describe('updateCompany', () => {
    it('should return 400 if id is invalid', async () => {
      req = { params: { id: '123' }, user: { id: new mongoose.Types.ObjectId().toString() } };
      await updateCompany(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should return 400 if user id is invalid', async () => {
      req = { params: { id: new mongoose.Types.ObjectId().toString() }, user: { id: 'invalidUserId' } };
      await updateCompany(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should return 404 if company is not found', async () => {
      req = { params: { id: new mongoose.Types.ObjectId().toString() }, user: { id: new mongoose.Types.ObjectId().toString() } };
      Company.findOne.mockResolvedValue(null);
      await updateCompany(req, res);
      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('should update company if all validations pass', async () => {
      const mockCompany = {
        name: 'Old Name',
        contactName: 'Old Contact',
        email: 'old@example.com',
        phone: '1234567890',
        save: jest.fn().mockResolvedValue({
          name: 'New Name',
          contactName: 'New Contact',
          email: 'new@example.com',
          phone: '0987654321'
        })
      };

      req = {
        params: { id: new mongoose.Types.ObjectId().toString() },
        user: { id: new mongoose.Types.ObjectId().toString() },
        body: {
          name: 'New Name',
          contactName: 'New Contact',
          email: 'new@example.com',
          phone: '0987654321'
        }
      };

      Company.findOne.mockResolvedValue(mockCompany);
      await updateCompany(req, res);
      expect(jsonMock).toHaveBeenCalledWith({
        name: 'New Name',
        contactName: 'New Contact',
        email: 'new@example.com',
        phone: '0987654321'
      });
    });
  });

  describe('deleteCompany', () => {
    it('should return 400 if id is invalid', async () => {
      req = { params: { id: '123' }, user: { id: new mongoose.Types.ObjectId().toString() } };
      await deleteCompany(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should return 400 if user id is invalid', async () => {
      req = { params: { id: new mongoose.Types.ObjectId().toString() }, user: { id: 'invalidUserId' } };
      await deleteCompany(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should return 404 if company is not found', async () => {
      req = { params: { id: new mongoose.Types.ObjectId().toString() }, user: { id: new mongoose.Types.ObjectId().toString() } };
      Company.findOneAndDelete.mockResolvedValue(null);
      await deleteCompany(req, res);
      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('should delete company if all validations pass', async () => {
      const mockDeletedCompany = { name: 'Deleted Company' };
      req = { params: { id: new mongoose.Types.ObjectId().toString() }, user: { id: new mongoose.Types.ObjectId().toString() } };
      Company.findOneAndDelete.mockResolvedValue(mockDeletedCompany);
      await deleteCompany(req, res);
      expect(jsonMock).toHaveBeenCalledWith({ message: "L'entreprise a été supprimée avec succès." });
    });
  });
});
