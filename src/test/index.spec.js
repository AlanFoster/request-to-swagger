import requestToSwagger from '../';

describe('simple', () => {
  it('should be sane', () => {
    expect(requestToSwagger()).toBe('Welcome to request-to-swagger');
  });
});
