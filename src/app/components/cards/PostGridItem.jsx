import React from 'react';
import {browserHistory, Link} from 'react-router';
import TimeAgoWrapper from '../elements/TimeAgoWrapper';
import Icon from '../elements/Icon';
import {connect} from 'react-redux';
import user from '../../redux/User';
import Reblog from '../elements/Reblog';
import Voting from '../elements/Voting';
import {immutableAccessor} from '../../utils/Accessors';
import extractContent from '../../utils/ExtractContent';
import VotesAndComments from '../elements/VotesAndComments';
import {Map} from 'immutable';
import Author from '../elements/Author';
import TagList from '../elements/TagList';
import UserNames from '../elements/UserNames';
import tt from 'counterpart';
import proxifyImageUrl from '../../utils/ProxifyUrl';
import Userpic, {avatarSize} from '../elements/Userpic';

function isLeftClickEvent(event) {
    return event.button === 0
}

function isModifiedEvent(event) {
    return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
}

function navigate(event, onClick, post, url) {
    if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
        return;
    }

    event.preventDefault();
    if (onClick) {
        onClick(post, url);
    } else {
        browserHistory.push(url);
    }
}

class PostGridItem extends React.Component {
    static propTypes = {
        post: React.PropTypes.string.isRequired,
        pendingPayout: React.PropTypes.string.isRequired,
        totalPayout: React.PropTypes.string.isRequired,
        content: React.PropTypes.object.isRequired,
        thumbSize: React.PropTypes.string,
        nsfwPref: React.PropTypes.string,
        onClick: React.PropTypes.func
    };

    shouldComponentUpdate(props) {
        return props.thumbSize !== this.props.thumbSize ||
            props.pendingPayout !== this.props.pendingPayout ||
            props.totalPayout !== this.props.totalPayout ||
            props.username !== this.props.username ||
            props.nsfwPref !== this.props.nsfwPref ||
            props.blogmode !== this.props.blogmode;
    }

    render() {
        const {ignore, onClick} = this.props;
        const {post, content} = this.props;
        const {account} = this.props;
        if (!content) return null;

        let rebloggedBy;
        if (content.get('reblogged_by') && content.get('reblogged_by').size > 0) {
            rebloggedBy = content.get('reblogged_by').toJS()
        }

        if (rebloggedBy) {
            rebloggedBy = (
                <div className="articles__resteem">
                    <p className="articles__resteem-text">
                        <span className="articles__resteem-icon"><Icon name="reblog"/></span>
                        {tt('postsummary_jsx.resteemed_by')} <UserNames names={rebloggedBy}/>
                    </p>
                </div>
            );
        }

        // 'account' is the current blog being viewed, if applicable.
        if (account && account != content.get('author')) {
            rebloggedBy = (
                <div className="PostGridItem__reblogged_by">
                    <Icon name="reblog"/> {tt('postsummary_jsx.resteemed')}
                </div>
            );
        }

        const {gray, authorRepLog10} = content.get('stats', Map()).toJS();
        const postContent = extractContent(immutableAccessor, content);
        const desc = postContent.desc;

        const isArchived = content.get('cashout_time') === '1969-12-31T23:59:59';
        const isfullPower = content.get('percent_steem_dollars') === 0;

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

        const contentBody = (
            <div className="PostGridItem__body entry-content">
                <Link to={titleLinkUrl}>{desc}</Link>
            </div>
        );

        const contentTitle = (
            <h2 className="articles__h2 entry-title">
                <Link to={titleLinkUrl}>
                    {titleText}
                </Link>
            </h2>
        );

        // New Post Summary heading
        const postAuthorDetails = (
            <div className="articles__summary-header">
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
                        <Link className="timestamp__link" to={titleLinkUrl}>
                            <span className="timestamp__time">
                                <TimeAgoWrapper date={postContent.created}
                                                className="updated"/>
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        );

        const summaryFooter = (
            <div className="articles__summary-footer">
                <Voting post={post} showList={false}/>
                <VotesAndComments post={post} commentsLink={commentsLink}/>
                <span className="PostGridItem__time_author_category">
                    {!isArchived && <Reblog author={postContent.author} permlink={postContent.permlink}
                                            parent_author={postContent.parent_author}/>}
                </span>
            </div>
        );

        const blogSize = proxifyImageUrl(postContent.image_link, '640x480').replace(/ /g, '%20');

        const thumb = (
            <span onClick={event => navigate(event, onClick, post, postContent.link)}
                  className="articles__feature-img-container">
                <img className="articles__feature-img" src={blogSize}/>
            </span>
        );

        const commentClasses = [];
        if (gray || ignore) {
            commentClasses.push('downvoted');
        }

        return (
            <div className="articles__summary">
                <div className={'articles__content hentry with-image ' + commentClasses.join(' ')}
                     itemScope itemType="http://schema.org/blogPost">

                    <div className="articles__content-block articles__content-block--img">
                        <Link className="articles__link" to={titleLinkUrl}>
                            {thumb}
                        </Link>
                    </div>
                    {postAuthorDetails}

                    <div className="articles__content-block articles__content-block--text">
                        {contentTitle}
                    </div>

                    {this.props.blogmode ? summaryFooter : null}
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
            blogmode: state.app.getIn(['user_preferences', 'blogmode']),
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
