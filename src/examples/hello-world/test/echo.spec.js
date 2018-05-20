import echoSchema from '../echo';
import searchedRepositoriesSchema from "../../github/search-repositories";

describe('echo', function () {
  it('generates a valid schema', function () {
    expect(echoSchema).toMatchSnapshot();
    expect(searchedRepositoriesSchema).toBeValidSwagger();
  });
});
