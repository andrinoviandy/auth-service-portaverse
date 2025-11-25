const { kmsMiddleware } = require("..");
const { mint } = require("../../commons/helpers/jwt");
const mockRequest = require("../../commons/mocks/mockRequest");
const mockResponse = require("../../commons/mocks/mockResponse");

const kmsMiddlewarePromise = (req, res, privilege) => {
  return new Promise((resolve, reject) => {
    kmsMiddleware(privilege)(req, res, (err) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
};

describe("Middlware smartkmsystem middleware test", () => {
  const jwt =
    "Bearer " +
    mint({
      uid: "kFLiHfTkQ8X1pUh4Dad3fguxyQ13",
      // group: 1,
      user_id: 36514,
      employee: { employee_id: 24150 },
      // role_code: "SME",
    });
  console.log(jwt);
  it("should be pass the middleware, jwt on smartkmsystemAuth cookies", async () => {
    const req = mockRequest({
      cookies: {
        smartkmsystemAuth: jwt,
      },
    });
    const res = mockResponse();
    const result = await kmsMiddlewarePromise(req, res);

    expect(res.locals.uid).toBeDefined();
    expect(res.locals.group).toBeDefined();
    expect(res.locals.user_id).toBeDefined();
    expect(res.locals.employee_id).toBeDefined();
    expect(res.locals.social_employee_profile_id).toBeDefined();
    expect(result);
  });

  it("should be pass the middleware, jwt on smartkmsystem-authorization header", async () => {
    const req = mockRequest({
      headers: {
        "smartkmsystem-authorization": jwt,
      },
    });
    const res = mockResponse();
    const result = await kmsMiddlewarePromise(req, res);

    expect(res.locals.uid).toBeDefined();
    expect(res.locals.group).toBeDefined();
    expect(res.locals.user_id).toBeDefined();
    expect(res.locals.employee_id).toBeDefined();
    expect(res.locals.social_employee_profile_id).toBeDefined();
    expect(result);
  });
});
