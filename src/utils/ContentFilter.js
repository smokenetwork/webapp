// https://github.com/smokenetwork/webapp/issues/40
export const filterState = (state) => {
  try {
    let deleted = [];

    for (const key in state.content) {
      const jsonMetadata = JSON.parse(state.content[key].json_metadata);

      // steemit/0.1 or smoke/* only
      if (!jsonMetadata.app.match(/^(smoke\/|steemit\/0.1)/)) {
        delete state.content[key];
        deleted.push(key);
      }
    }

    // continue to delete accounts.xxx.blog and comments
    for (const acc in state.accounts) {
      if (state.accounts[acc]["blog"]) {
        state.accounts[acc]["blog"] = state.accounts[acc]["blog"].filter((e) => {
          return !deleted.includes(e);
        });
      }

      if (state.accounts[acc]["comments"]) {
        state.accounts[acc]["comments"] = state.accounts[acc]["comments"].filter((e) => {
          return !deleted.includes(e);
        });
      }

      if (state.accounts[acc]["recent_replies"]) {
        state.accounts[acc]["recent_replies"] = state.accounts[acc]["recent_replies"].filter((e) => {
          return !deleted.includes(e);
        });
      }
    }

    // continue on discussion_idx
    for (const tag in state["discussion_idx"]) {
      for (const discussion_key in state["discussion_idx"][tag]) {
        if (state["discussion_idx"][tag][discussion_key] instanceof Array) {
          state["discussion_idx"][tag][discussion_key] = state["discussion_idx"][tag][discussion_key].filter((e) => {
            return !deleted.includes(e);
          });
        }
      }
    }

    // console.log(`deleted: ${JSON.stringify(deleted)}`);
  } catch (error) {
    // do nothing
    console.error(error);
  }

  // console.log(`filterState: ${JSON.stringify(state)}`);
  return state;
};

export const filterData = (data) => {
    // https://github.com/smokenetwork/webapp/issues/40
    try {
      data = data.filter((e) => {
        // steemit/0.1 or smoke/* only
        if (JSON.parse(e.json_metadata).app.match(/^(smoke\/|steemit\/0.1)/)) {
          return true;
        }

        return false;
      });

      // console.log(JSON.stringify(data));
    } catch (error) {
      // do nothing
    }

    // console.log(`filterData: ${JSON.stringify(data)}`);
    return data;
};

// export const filterContent = (content) => {
//   console.log(`filterContent: ${JSON.stringify(content)}`);
//   return content;
// };
