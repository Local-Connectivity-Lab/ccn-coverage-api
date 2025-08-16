import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import {
  putSecureSite,
  postSecureSite,
  deleteSecureSite,
} from '../routes/secure-site';
import { Site } from '../models/site';

describe('secure-site event handlers', function () {
  describe('PUT /api/secure-site', function () {
    it('400 if name missing', async function () {
      const req = httpMocks.createRequest({ method: 'PUT', body: {} });
      const res = httpMocks.createResponse();

      await putSecureSite(req, res);

      assert.strictEqual(res._getStatusCode(), 400);
      assert.deepStrictEqual(res._getJSONData(), {
        error: 'Site name is required',
      });
    });

    it('404 if site not found', async function () {
      (Site.findOneAndUpdate as any) = async () => null;

      const req = httpMocks.createRequest({
        method: 'PUT',
        body: { name: 'X' },
      });
      const res = httpMocks.createResponse();

      await putSecureSite(req, res);

      assert.strictEqual(res._getStatusCode(), 404);
      assert.deepStrictEqual(res._getJSONData(), { error: 'Site not found' });
    });

    it('200 on success', async function () {
      (Site.findOneAndUpdate as any) = async () => ({ name: 'X' });

      const req = httpMocks.createRequest({
        method: 'PUT',
        body: { name: 'X' },
      });
      const res = httpMocks.createResponse();

      await putSecureSite(req, res);

      assert.strictEqual(res._getStatusCode(), 200);
      assert.deepStrictEqual(res._getJSONData(), {
        message: 'Site updated successfully',
      });
    });

    it('500 on error', async function () {
      (Site.findOneAndUpdate as any) = async () => {
        throw new Error('fail');
      };

      const req = httpMocks.createRequest({
        method: 'PUT',
        body: { name: 'X' },
      });
      const res = httpMocks.createResponse();

      await putSecureSite(req, res);

      assert.strictEqual(res._getStatusCode(), 500);
      assert.deepStrictEqual(res._getJSONData(), {
        error: 'Internal server error',
      });
    });
  });

  describe('POST /api/secure-site', function () {
    it('201 on success', async function () {
      (Site.build as any) = () => ({ save: async () => ({}) });

      const req = httpMocks.createRequest({
        method: 'POST',
        body: { name: 'New' },
      });
      const res = httpMocks.createResponse();

      await postSecureSite(req, res);

      assert.strictEqual(res._getStatusCode(), 201);
      assert.deepStrictEqual(res._getJSONData(), {
        message: 'Site created successfully',
      });
    });

    it('400 on validation error', async function () {
      (Site.build as any) = () => ({
        save: async () => {
          throw { name: 'ValidationError', message: 'Bad' };
        },
      });

      const req = httpMocks.createRequest({
        method: 'POST',
        body: { name: 'Invalid' },
      });
      const res = httpMocks.createResponse();

      await postSecureSite(req, res);

      assert.strictEqual(res._getStatusCode(), 400);
      assert.deepStrictEqual(res._getJSONData(), {
        error: 'Validation error',
        details: 'Bad',
      });
    });

    it('500 on other error', async function () {
      (Site.build as any) = () => ({
        save: async () => {
          throw new Error('fail');
        },
      });

      const req = httpMocks.createRequest({
        method: 'POST',
        body: { name: 'X' },
      });
      const res = httpMocks.createResponse();

      await postSecureSite(req, res);

      assert.strictEqual(res._getStatusCode(), 500);
      assert.deepStrictEqual(res._getJSONData(), {
        error: 'Internal server error',
      });
    });
  });

  describe('DELETE /api/secure-site', function () {
    it('400 if name missing', async function () {
      const req = httpMocks.createRequest({ method: 'DELETE', body: {} });
      const res = httpMocks.createResponse();

      await deleteSecureSite(req, res);

      assert.strictEqual(res._getStatusCode(), 400);
      assert.deepStrictEqual(res._getJSONData(), {
        error: 'Site name is required',
      });
    });

    it('404 if site not found', async function () {
      (Site.findOneAndDelete as any) = async () => null;

      const req = httpMocks.createRequest({
        method: 'DELETE',
        body: { name: 'X' },
      });
      const res = httpMocks.createResponse();

      await deleteSecureSite(req, res);

      assert.strictEqual(res._getStatusCode(), 404);
      assert.deepStrictEqual(res._getJSONData(), { error: 'Site not found' });
    });

    it('200 on success', async function () {
      (Site.findOneAndDelete as any) = async () => ({ name: 'X' });

      const req = httpMocks.createRequest({
        method: 'DELETE',
        body: { name: 'X' },
      });
      const res = httpMocks.createResponse();

      await deleteSecureSite(req, res);

      assert.strictEqual(res._getStatusCode(), 200);
      assert.deepStrictEqual(res._getJSONData(), {
        message: 'Site deleted successfully',
        site: { name: 'X' },
      });
    });

    it('500 on error', async function () {
      (Site.findOneAndDelete as any) = async () => {
        throw new Error('fail');
      };

      const req = httpMocks.createRequest({
        method: 'DELETE',
        body: { name: 'X' },
      });
      const res = httpMocks.createResponse();

      await deleteSecureSite(req, res);

      assert.strictEqual(res._getStatusCode(), 500);
      assert.deepStrictEqual(res._getJSONData(), {
        error: 'Internal server error',
      });
    });
  });
});
