/* eslint react/prop-types: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import constants from '../../redux/constants';
import shouldComponentUpdate from '../../utils/shouldComponentUpdate';
import PostsGrid from '../cards/PostsGrid';
import {isFetchingOrRecentlyUpdated} from '../../utils/StateFunctions';
import {Link} from 'react-router';
import tt from 'counterpart';
import Immutable from 'immutable';
import Callout from '../elements/Callout';
import Topics from './Topics';
import TagTabs from '../modules/TagTabs';

class PostsIndex extends React.Component {

  static propTypes = {
    discussions: PropTypes.object,
    accounts: PropTypes.object,
    status: PropTypes.object,
    routeParams: PropTypes.object,
    requestData: PropTypes.func,
    loading: PropTypes.bool,
    username: PropTypes.string,
    blogmode: PropTypes.bool,
  };

  static defaultProps = {
    showSpam: false
  }

  constructor() {
    super();
    this.state = {}
    this.loadMore = this.loadMore.bind(this);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'PostsIndex')
  }

  componentDidUpdate(prevProps) {
    if (window.innerHeight && window.innerHeight > 3000 && prevProps.discussions !== this.props.discussions) {
      this.refs.list.fetchIfNeeded();
    }
  }

  getPosts(order, category) {
    const topic_discussions = this.props.discussions.get(category || '');
    if (!topic_discussions) return null;
    return topic_discussions.get(order);
  }

  loadMore(last_post) {
    if (!last_post) return;
    let {accountname} = this.props.routeParams
    let {category, order = constants.DEFAULT_SORT_ORDER} = this.props.routeParams;
    if (category === 'feed') {
      accountname = order.slice(1);
      order = 'by_feed';
    }
    if (isFetchingOrRecentlyUpdated(this.props.status, order, category)) return;
    const [author, permlink] = last_post.split('/');
    this.props.requestData({author, permlink, order, category, accountname});
  }

  onShowSpam = () => {
    this.setState({showSpam: !this.state.showSpam})
  }

  render() {
    let {category, order = constants.DEFAULT_SORT_ORDER} = this.props.routeParams;
    let topics_order = order;
    let posts = [];
    let emptyText = '';
    if (category === 'feed') {
      const account_name = order.slice(1);
      order = 'by_feed';
      topics_order = 'trending';
      posts = this.props.accounts.getIn([account_name, 'feed']);
      const isMyAccount = this.props.username === account_name;
      if (isMyAccount) {
        emptyText = <div>
          {tt('posts_index.empty_feed_1')}.<br/><br/>
          <i>{tt('posts_index.empty_feed_2')}.</i><br/><br/>
          <a href="/trending" className="button">{tt('posts_index.empty_feed_3')}</a>
        </div>;
      } else {
        emptyText = <div>{tt('user_profile.user_hasnt_followed_anything_yet', {name: account_name})}</div>;
      }
    } else {
      posts = this.getPosts(order, category);
      if (posts && posts.size === 0) {
        emptyText = <div>{'No ' + topics_order + (category ? ' #' + category : '') + ' posts found'}</div>;
      }
    }

    const status = this.props.status ? this.props.status.getIn([category || '', order]) : null;
    const fetching = (status && status.fetching) || this.props.loading;
    const {showSpam} = this.state;

    // If we're at one of the four sort order routes without a tag filter,
    // use the translated string for that sort order, f.ex "trending"
    //
    // If you click on a tag while you're in a sort order route,
    // the title should be the translated string for that sort order
    // plus the tag string, f.ex "trending: blog"
    //
    // Logged-in:
    // At homepage (@user/feed) say "People I follow"
    let page_title = 'Posts'; // sensible default here?
    if (typeof this.props.username !== 'undefined' && category === 'feed') {
      page_title = 'People I follow'; // todo: localization
    } else {
      switch (topics_order) {
        case 'trending': // cribbed from Header.jsx where it's repeated 2x already :P
          page_title = tt('main_menu.trending');
          break;
        case 'created':
          page_title = tt('g.new');
          break;
        case 'hot':
          page_title = tt('main_menu.hot');
          break;
        case 'promoted':
          page_title = tt('g.promoted');
          break;
      }
      if (typeof category !== 'undefined') {
        page_title = `${page_title}: ${category}`; // maybe todo: localize the colon?
      }
    }

    const layoutClass = this.props.blogmode ? ' layout-block' : ' layout-list';

    return (
      <div className={'PostsIndex row' + (fetching ? ' fetching' : '') + layoutClass}>
        <TagTabs/>
        <div className="column ad1">
          <br />
          <div data-mantis-zone="smokeio" data-mantis-refresh="true"></div>
        </div>
        <article className="articles">
          {(!fetching && (posts && !posts.size)) ? <Callout>{emptyText}</Callout> :
            <PostsGrid
              ref="list"
              posts={posts ? posts : Immutable.List()}
              loading={fetching}
              category={topics_order}
              loadMore={this.loadMore}
              showSpam={showSpam}
            />
          }
        </article>
      </div>
    );
  }
}


module.exports = {
  path: ':order(/:category)',
  component: connect(
    (state) => {
      return {
        discussions: state.global.get('discussion_idx'),
        status: state.global.get('status'),
        loading: state.app.get('loading'),
        accounts: state.global.get('accounts'),
        username: state.user.getIn(['current', 'username']) || state.offchain.get('account'),
        blogmode: state.app.getIn(['user_preferences', 'blogmode']),
      };
    },
    (dispatch) => {
      return {
        requestData: (args) => dispatch({type: 'REQUEST_DATA', payload: args}),
      }
    }
  )(PostsIndex)
};
