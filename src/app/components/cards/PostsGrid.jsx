import React, {PropTypes} from 'react';
import PostGridItem from './PostGridItem';
import LoadingIndicator from '../elements/LoadingIndicator';
import debounce from 'lodash.debounce';
import {findParent} from '../../utils/DomUtils';
import shouldComponentUpdate from '../../utils/shouldComponentUpdate';
import {connect} from 'react-redux'
import shortid from 'shortid'
import extractContent from '../../utils/ExtractContent';
import {immutableAccessor} from '../../utils/Accessors';

function topPosition(domElt) {
  if (!domElt) {
    return 0;
  }
  return domElt.offsetTop + topPosition(domElt.offsetParent);
}

class PostsGrid extends React.Component {

  static propTypes = {
    posts: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    category: PropTypes.string,
    loadMore: PropTypes.func,
    showSpam: PropTypes.bool,
    fetchState: PropTypes.func.isRequired,
    pathname: PropTypes.string,
  };

  static defaultProps = {
    showSpam: false,
  };

  constructor() {
    super();
    this.state = {
      thumbSize: 'desktop',
      showNegativeComments: false,
      showPost: null
    };

    this.scrollListener = this.scrollListener.bind(this);
    this.onPostClick = this.onPostClick.bind(this);
    this.onBackButton = this.onBackButton.bind(this);
    this.closeOnOutsideClick = this.closeOnOutsideClick.bind(this);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'PostsGrid')
  }

  componentDidMount() {
    this.attachScrollListener();
  }

  componentWillUpdate() {
    const location = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (this.state.showPost && (location !== this.post_url)) {
      this.setState({showPost: null});
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.showPost && !prevState.showPost) {
      document.getElementsByTagName('body')[0].className = 'with-post-overlay';
      window.addEventListener('popstate', this.onBackButton);
      window.addEventListener('keydown', this.onBackButton);
      const post_overlay = document.getElementById('post_overlay');

      if (post_overlay) {
        post_overlay.addEventListener('click', this.closeOnOutsideClick);
        post_overlay.focus();
      }
    }

    if (!this.state.showPost && prevState.showPost) {
      window.history.pushState({}, '', this.props.pathname);
      document.getElementsByTagName('body')[0].className = '';
      this.post_url = null;
    }
  }

  componentWillUnmount() {
    this.detachScrollListener();
    window.removeEventListener('popstate', this.onBackButton);
    window.removeEventListener('keydown', this.onBackButton);

    const post_overlay = document.getElementById('post_overlay');

    if (post_overlay) {
      post_overlay.removeEventListener('click', this.closeOnOutsideClick);
    }

    document.getElementsByTagName('body')[0].className = '';
  }

  onBackButton(event) {
    if ('keyCode' in event && event.keyCode !== 27) {
      return;
    }

    window.removeEventListener('popstate', this.onBackButton);
    window.removeEventListener('keydown', this.onBackButton);
    this.closePostModal();
  }

  closeOnOutsideClick(event) {
    const inside_post = findParent(event.target, 'PostsGrid__post_container');
    if (!inside_post) {
      const inside_top_bar = findParent(event.target, 'PostsGrid__post_top_bar');
      if (!inside_top_bar) {
        const post_overlay = document.getElementById('post_overlay');
        if (post_overlay) post_overlay.removeEventListener('click', this.closeOnOutsideClick);
        this.closePostModal();
      }
    }
  }

  fetchIfNeeded() {
    this.scrollListener();
  }

  closePostModal = () => {
    window.document.title = this.state.prevTitle;
    this.setState({showPost: null, prevTitle: null});
  };

  scrollListener = debounce(
    () => {
      const el = window.document.getElementById('posts_list');
      if (!el) return;
      const scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset :
        (document.documentElement || document.body.parentNode || document.body).scrollTop;
      if (topPosition(el) + el.offsetHeight - scrollTop - window.innerHeight < 10) {
        const {loadMore, posts, category} = this.props;
        if (loadMore && posts && posts.size) loadMore(posts.last(), category);
      }

      // Detect if we're in mobile mode (renders larger preview imgs)
      const mq = window.matchMedia('screen and (max-width: 39.9375em)');
      if (mq.matches) {
        this.setState({thumbSize: 'mobile'})
      } else {
        this.setState({thumbSize: 'desktop'})
      }
    },
    150
  );

  attachScrollListener() {
    window.addEventListener('scroll', this.scrollListener, {capture: false, passive: true});
    window.addEventListener('resize', this.scrollListener, {capture: false, passive: true});
    this.scrollListener();
  }

  detachScrollListener() {
    window.removeEventListener('scroll', this.scrollListener);
    window.removeEventListener('resize', this.scrollListener);
  }

  onPostClick(post, url) {
    this.post_url = url;
    this.props.fetchState(url);
    this.props.removeHighSecurityKeys();
    this.setState({showPost: post, prevTitle: window.document.title});
    window.history.pushState({}, '', url);
  }

  render() {
    const {
      posts, showSpam, loading, content,
      ignore_result, account
    } = this.props;

    const {thumbSize} = this.state;

    const filteredPosts = [];

    posts.forEach((item) => {
      const cont = content.get(item);
      if (!cont) {
        console.error('PostsGrid --> Missing content key', item);
        return;
      }
      const p = extractContent(immutableAccessor, cont);

      const ignore = ignore_result && ignore_result.has(cont.get('author'));
      const hide = cont.getIn(['stats', 'hide']);
      if (p.json_metadata.app === 'steemit/0.1') {
        if (!(ignore || hide) || showSpam) {
          filteredPosts.push({item, ignore});
        }
      }
    });

    /**
     * @param {Post[]} items
     * @returns {string}
     */
    const renderItemsInGrid = (items) => {
      const itemsPerRow = 3;
      const rows = [...Array(Math.ceil(items.length / itemsPerRow))];
      const itemRows = rows.map((row, i) => items.slice(i * itemsPerRow, (i * itemsPerRow) + itemsPerRow));

      const gridContent = itemRows.map((row) => {
        return (
          <div className="row" key={shortid.generate()}>
            {row.map((item) => {
              return (
                <div className="columns large-4 medium-6 small-12" key={item.item}>
                  <PostGridItem
                    account={account}
                    post={item.item}
                    thumbSize={thumbSize}
                    ignore={item.ignore}
                    onClick={this.onPostClick}
                  />
                </div>
              );
            })}
          </div>
        )
      });
      //if (gridContent.length>8){
      return (
        <div>
          {gridContent}
        </div>
      );
      //}
    };

    return (
      <div id="posts_list" className="PostsGrid">
        <div className="PostsGrid__posts" itemScope itemType="http://schema.org/blogPosts">
          {renderItemsInGrid(filteredPosts)}
        </div>
        {loading && <LoadingIndicator style={{marginBottom: "2rem"}} type="circle"/>}
      </div>
    );
  }
}

export default connect(
  (state, props) => {
    const pathname = state.app.get('location').pathname;
    const current = state.user.get('current');
    const username = current ? current.get('username') : state.offchain.get('account');
    const content = state.global.get('content');
    const ignore_result = state.global.getIn(['follow', 'getFollowingAsync', username, 'ignore_result']);
    return {...props, username, content, ignore_result, pathname};
  },
  dispatch => ({
    fetchState: (pathname) => {
      dispatch({type: 'FETCH_STATE', payload: {pathname}})
    },
    removeHighSecurityKeys: () => {
      dispatch({type: 'user/REMOVE_HIGH_SECURITY_KEYS'})
    }
  })
)(PostsGrid)
