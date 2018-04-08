export default class PostHelper {
    /**
     * Gets all the authors from the content.
     *
     * @param {object} content
     * @returns {string[]}
     */

    getAccountsFromContent(content) {
        if (content) {
            const postAuthors = new Set();
            Object.entries(content).forEach(([key, post]) => {
                postAuthors.add(post.author);
            });

            return [...postAuthors];
        }
        return [];
    }

    /**
     * Adds the account data to the state.
     *
     * @param {object[]} accounts
     * @param {object} state
     */
    addAccountsToState(accounts, state) {
        accounts.forEach((account) => {
            state.accounts[account.name] = account;
        });
    }
}
