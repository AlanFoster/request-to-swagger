import searchedRepositoriesSchema from '../search-repositories';

describe('echo', function () {
  it('generates a valid schema', function () {
    expect(searchedRepositoriesSchema).toMatchSnapshot();
    expect(searchedRepositoriesSchema).toBeValidSwagger();
  });
});
