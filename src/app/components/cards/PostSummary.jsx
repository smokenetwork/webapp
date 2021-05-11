import React from 'react';
import PropTypes from 'prop-types';
import {Link, browserHistory} from 'react-router';
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
import ImageUserBlockList from '../../utils/ImageUserBlockList';
import proxifyImageUrl from '../../utils/ProxifyUrl';
import Userpic, {avatarSize} from '../elements/Userpic';

function isLeftClickEvent(event) {
  return event.button === 0
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
}

function navigate(e, onClick, post, url) {
  if (isModifiedEvent(e) || !isLeftClickEvent(e)) return;
  e.preventDefault();
  if (onClick) onClick(post, url);
  else browserHistory.push(url);
}

class PostSummary extends React.Component {
  static propTypes = {
    post: PropTypes.string.isRequired,
    pending_payout: PropTypes.string.isRequired,
    total_payout: PropTypes.string.isRequired,
    content: PropTypes.object.isRequired,
    thumbSize: PropTypes.string,
    nsfwPref: PropTypes.string,
    onClick: PropTypes.func
  };

  constructor() {
    super();
    this.state = {revealNsfw: false}
    this.onRevealNsfw = this.onRevealNsfw.bind(this)
  }

  shouldComponentUpdate(props, state) {
    return props.thumbSize !== this.props.thumbSize ||
      props.pending_payout !== this.props.pending_payout ||
      props.total_payout !== this.props.total_payout ||
      props.username !== this.props.username ||
      props.nsfwPref !== this.props.nsfwPref ||
      props.blogmode !== this.props.blogmode ||
      state.revealNsfw !== this.state.revealNsfw;
  }

  onRevealNsfw(e) {
    e.preventDefault();
    this.setState({revealNsfw: true})
  }

  render() {
    const {thumbSize, ignore, onClick} = this.props;
    const {post, content} = this.props;
    const {account} = this.props;
    if (!content) return null;

    let reblogged_by;
    if (content.get('reblogged_by') && content.get('reblogged_by').size > 0) {
      reblogged_by = content.get('reblogged_by').toJS()
    }

    if (reblogged_by) {
      reblogged_by = (
        <div className="articles__resteem">
          <p className="articles__resteem-text">
            <span className="articles__resteem-icon"><Icon name="reblog"/></span>
            {tt('postsummary_jsx.resteemed_by')} <UserNames names={reblogged_by}/>
          </p>
        </div>)
    }

    // 'account' is the current blog being viewed, if applicable.
    if (account && account != content.get('author')) {
      reblogged_by = (<div className="PostSummary__reblogged_by">
        <Icon name="reblog"/> {tt('postsummary_jsx.resteemed')}
      </div>)
    }

    /*const url_arr = location.href.split("/");
    if ((url_arr.length == 4) && (url_arr[3].startsWith("@"))) {
        if (reblogged_by) return null;
    }
    if ((url_arr.length == 5) && (url_arr[4] === "shares")) {
        console.log('skip');
        if (!reblogged_by) return null;
    } else console.log('ok');*/

    const {gray, authorRepLog10, flagWeight, isNsfw} = content.get('stats', Map()).toJS()
    const p = extractContent(immutableAccessor, content);
    const desc = p.desc

    const archived = content.get('cashout_time') === '1969-12-31T23:59:59' // TODO: audit after HF17. #1259
    const full_power = content.get('percent_steem_dollars') === 0;

    let post_url;
    let title_text;
    let comments_url;

    if (content.get('depth') > 0) {
      title_text = tt('g.re_to', {topic: content.get('root_title')});
      post_url = '/' + content.get('category') + '/@' + content.get('parent_author') + '/' + content.get('parent_permlink') + '#@' + content.get('author') + '/' + content.get('permlink');
      comments_url = p.link + '#comments';
    } else {
      title_text = p.title;
      post_url = p.link;
      comments_url = post_url + '#comments';
    }

    const content_body = (<div className="PostSummary__body entry-content">
      <Link to={post_url}>{desc}</Link>
    </div>);
    const content_title = (<h2 className="articles__h2 entry-title">
      <Link to={post_url}>
        {isNsfw && <span className="nsfw-flag">nsfw</span>}
        {title_text}
      </Link>
    </h2>);

    // author and category
    const author_category = (<span className="vcard">
            <Userpic account={p.author} rep={authorRepLog10} />
            <Author author={p.author} authorRepLog10={authorRepLog10} follow={false} mute={false}/>
      {} {tt('g.in')} <TagList post={p} single/>&nbsp;•&nbsp;
      <Link to={post_url}><TimeAgoWrapper date={p.created} className="updated"/></Link>
        </span>);

    // New Post Summary heading
    const summary_header = (
      <div className="articles__summary-header">
        <div className="user">
          {!isNsfw
            ? <div className="user__col user__col--left">
              <a className="user__link" href={'/@' + p.author}>
                <Userpic account={p.author} size={avatarSize.small} rep={authorRepLog10} />
              </a>
            </div>
            : null
          }
          <div className="user__col user__col--right">

            <span className="user__name"><Author author={p.author} authorRepLog10={authorRepLog10} follow={false}
                                                 mute={false}/></span>

            <span className="articles__tag-link">{tt('g.in')}&nbsp;<TagList post={p} single/>&nbsp;•&nbsp;</span>
            <Link className="timestamp__link" to={post_url}>
              <span className="timestamp__time"><TimeAgoWrapper date={p.created} className="updated"/></span>
            </Link>
          </div>
        </div>
        <div className="articles__flag">
          <Voting post={post} flag/>
        </div>
      </div>
    );

    const content_footer = (<div className="PostSummary__footer">
      <Voting post={post} showList={false}/>
      <VotesAndComments post={post} commentsLink={comments_url}/>
      <span className="PostSummary__time_author_category">
                {/* {!archived && <Reblog author={p.author} permlink={p.permlink} parent_author={p.parent_author} />} */}
        <span className="show-for-medium">
                    {author_category}
                </span>
            </span>
    </div>)

    const summary_footer = (
      <div className="articles__summary-footer">
        <Voting post={post} showList={false}/>
        <VotesAndComments post={post} commentsLink={comments_url}/>
        <span className="PostSummary__time_author_category">
                    {/* {!archived && <Reblog author={p.author} permlink={p.permlink} parent_author={p.parent_author} />} */}
                </span>
      </div>
    )

    const {nsfwPref, username} = this.props
    const {revealNsfw} = this.state

    if (isNsfw) {
      if (nsfwPref === 'hide') {
        // user wishes to hide these posts entirely
        return null;
      } else if (nsfwPref === 'warn' && !revealNsfw) {
        // user wishes to be warned, and has not revealed this post
        return (
          <article className={'PostSummary hentry'} itemScope itemType="http://schema.org/blogPost">
            <div className="PostSummary__nsfw-warning">
              {summary_header}
              <span className="nsfw-flag">nsfw</span>&nbsp;&nbsp;<a href="#"
                                                                    onClick={this.onRevealNsfw}>{tt('postsummary_jsx.reveal_it')}</a> {tt('g.or') + ' '}
              {username ? <span>{tt('postsummary_jsx.adjust_your')} <Link
                  to={`/@${username}/settings`}>{tt('postsummary_jsx.display_preferences')}</Link>.</span>
                : <span><Link
                  to="/pick_account">{tt('postsummary_jsx.create_an_account')}</Link> {tt('postsummary_jsx.to_save_your_preferences')}.</span>}

              {summary_footer}
            </div>
          </article>
        )
      }
    }

    const userBlacklisted = ImageUserBlockList.includes(p.author)

    let thumb = null;
    if (!gray && p.image_link && !userBlacklisted) {
      // on mobile, we always use blog layout style -- there's no toggler
      // on desktop, we offer a choice of either blog or list
      // if blogmode is false, output an image with a srcset
      // which has the 256x512 for whatever the large breakpoint is where the list layout is used
      // and the 640 for lower than that

      const blogSize = proxifyImageUrl(p.image_link, '640x480').replace(/ /g, '%20');

      if (this.props.blogmode) {
        thumb = (
          <span onClick={e => navigate(e, onClick, post, p.link)} className="articles__feature-img-container">
                        <img className="articles__feature-img" src={blogSize}/>
                    </span>
        );
      } else {
        const listSize = proxifyImageUrl(p.image_link, '220x130').replace(/ /g, '%20');

        thumb = (
          <span onClick={e => navigate(e, onClick, post, p.link)} className="articles__feature-img-container">
                        <picture className="articles__feature-img">
                            <source srcSet={listSize} media="(min-width: 64em)"/>
                            <img srcSet={blogSize}/>
                        </picture>
                    </span>
        );
      }
    }
    const commentClasses = []
    if (gray || ignore) commentClasses.push('downvoted') // rephide

    return (
      <div className="articles__summary">
        <div className={'articles__content hentry' + (thumb ? ' with-image ' : ' ') + commentClasses.join(' ')}
             itemScope itemType="http://schema.org/blogPost">
          {thumb
            ? <div className="articles__content-block articles__content-block--img">
              <Link className="articles__link" to={post_url}>
                {thumb}
              </Link>
            </div>
            : null
          }
          <div className="articles__content-block articles__content-block--text">
            {reblogged_by}
            {summary_header}

            {content_title}
            {content_body}
            {this.props.blogmode ? null : summary_footer}
          </div>
          {this.props.blogmode ? summary_footer : null}
        </div>
      </div>
    )
  }
}

export default connect(
  (state, props) => {
    const {post} = props;
    const content = state.global.get('content').get(post);
    let pending_payout = 0;
    let total_payout = 0;
    if (content) {
      pending_payout = content.get('pending_payout_value');
      total_payout = content.get('total_payout_value');
    }
    return {
      post, content, pending_payout, total_payout,
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
)(PostSummary)
