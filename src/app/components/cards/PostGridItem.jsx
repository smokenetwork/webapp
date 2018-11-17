import tt from 'counterpart';
import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import user from '../../redux/User';
import {immutableAccessor} from '../../utils/Accessors';
import extractContent from '../../utils/ExtractContent';
import proxifyImageUrl from '../../utils/ProxifyUrl';
import Author from '../elements/Author';
import Comments from '../elements/Comments';
import Reblog from '../elements/Reblog';
import TimeAgoWrapper from '../elements/TimeAgoWrapper';
import Userpic, {avatarSize} from '../elements/Userpic';
import Voting from '../elements/Voting';
import {DEFAULT_POST_IMAGE_SMALL} from './PostConstants';

class PostGridItem extends React.Component {
  static propTypes = {
    post: React.PropTypes.string.isRequired,
    pendingPayout: React.PropTypes.string.isRequired,
    totalPayout: React.PropTypes.string.isRequired,
    content: React.PropTypes.object.isRequired,
    thumbSize: React.PropTypes.string,
  };

  shouldComponentUpdate(props) {
    return props.thumbSize !== this.props.thumbSize ||
      props.pendingPayout !== this.props.pendingPayout ||
      props.totalPayout !== this.props.totalPayout ||
      props.username !== this.props.username;
  }

  render() {
    const {post, content} = this.props;
    if (!content) {
      return null;
    }

    const postContent = extractContent(immutableAccessor, content);
    const isArchived = content.get('cashout_time') === '1969-12-31T23:59:59';

    let titleLinkUrl;
    let titleText = postContent.title;
    let commentsLink;

    if (content.get('parent_author') !== '') {
      titleText = tt('g.re_to', {topic: content.get('root_title')});
      titleLinkUrl = content.get('url');
      commentsLink = titleLinkUrl;
    } else {
      titleLinkUrl = postContent.link;
      commentsLink = postContent.link + '#comments';
    }

    const contentTitle = (
      <h2 className="articles__h2 entry-title">
        <Link to={titleLinkUrl}>
          {titleText}
        </Link>
      </h2>
    );

    const contentDetails = (
      <div className="articles__content-header">
        <div className="user">
          <div className="user__col user__col--left">
            <a className="user__link" href={'/@' + postContent.author}>
              <Userpic account={postContent.author} size={avatarSize.small}/>
            </a>
          </div>
          <div className="user__col user__col--right">
                        <span className="user__name">
                            <Author author={postContent.author}
                                    follow={false}
                                    mute={false}/>
                        </span>
            <span style={{display: 'block', margin: '0 2px 0 10px'}}>
                            <Link className="timestamp__link" to={titleLinkUrl}>
                                <span className="timestamp__time">
                                    <TimeAgoWrapper date={postContent.created} className="updated"/>
                                </span>
                            </Link>
                        </span>
          </div>
          <span className="PostGridItem__time_author_category">
                        {!isArchived && <Reblog author={postContent.author}
                                                permlink={postContent.permlink}
                                                parent_author={postContent.parent_author}/>}
                    </span>
        </div>
      </div>
    );

    let thumbnailImage;
    if (postContent.image_link) {
      thumbnailImage = proxifyImageUrl(postContent.image_link, '640x480').replace(/ /g, '%20');
    } else {
      thumbnailImage = DEFAULT_POST_IMAGE_SMALL;
    }

    return (
      <div className="articles__content">
        <div className="hentry with-image"
             itemScope
             itemType="http://schema.org/blogPost">

          {contentDetails}

          {thumbnailImage && <Link
            to={titleLinkUrl}
            className="articles__content-block--img"
            style={Object.assign({}, {backgroundImage: `url(${thumbnailImage})`})}>
          </Link>
          }

          <div className="articles__content-block--text">
                        <span className="articles__content-title">
                            {contentTitle}
                        </span>
            <hr/>
            <span className="articles__content-stats">
                            <Voting post={post} showList={false}/>

                            <Comments post={post} commentsLink={commentsLink}/>

                        </span>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  (state, props) => {
    const {post} = props;
    const content = state.global.get('content').get(post);
    let pendingPayout = 0;
    let totalPayout = 0;

    if (content) {
      pendingPayout = content.get('pending_payout_value');
      totalPayout = content.get('total_payout_value');
    }

    return {
      post, content, pendingPayout, totalPayout,
      username: state.user.getIn(['current', 'username']) || state.offchain.get('account'),
    };
  },

  (dispatch) => ({
    dispatchSubmit: data => {
      dispatch(user.actions.usernamePasswordLogin({...data}))
    },
    clearError: () => {
      dispatch(user.actions.loginError({error: null}))
    }
  })
)(PostGridItem)
