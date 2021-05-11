/* eslint react/prop-types: 0 */
import React from 'react';
import {browserHistory, Link} from 'react-router';
import {connect} from 'react-redux';
import transaction from '../../redux/Transaction';
import user from '../../redux/User';
import Icon from '../elements/Icon'
import UserKeys from '../elements/UserKeys';
import PasswordReset from '../elements/PasswordReset';
import UserWallet from '../modules/UserWallet';
import Settings from '../modules/Settings';
import CurationRewards from '../modules/CurationRewards';
import AuthorRewards from '../modules/AuthorRewards';
import UserList from '../elements/UserList';
import Follow from '../elements/Follow';
import LoadingIndicator from '../elements/LoadingIndicator';
import PostsList from '../cards/PostsList';
import PostsGrid from '../cards/PostsGrid';
import {isFetchingOrRecentlyUpdated} from '../../utils/StateFunctions';
import {repLog10} from '../../utils/ParsersAndFormatters.js';
import Tooltip from '../elements/Tooltip';
import DropdownMenu from '../elements/DropdownMenu';
import VerticalMenu from '../elements/VerticalMenu';
import DateJoinWrapper from '../elements/DateJoinWrapper';
import tt from 'counterpart';
import WalletSubMenu from '../elements/WalletSubMenu';
import Userpic from '../elements/Userpic';
import Callout from '../elements/Callout';
import normalizeProfile from '../../utils/NormalizeProfile';
import userIllegalContent from '../../utils/userIllegalContent';
import proxifyImageUrl from '../../utils/ProxifyUrl';
import SanitizedLink from '../elements/SanitizedLink';

export default class UserProfile extends React.Component {
  constructor() {
    super();
    this.state = {};
    this.onPrint = () => {
      window.print()
    };
    this.loadMore = this.loadMore.bind(this);
  }

  shouldComponentUpdate(np) {
    const {follow} = this.props;
    const {follow_count} = this.props;

    let followersLoading = false, npFollowersLoading = false;
    let followingLoading = false, npFollowingLoading = false;

    const account = np.routeParams.accountname.toLowerCase();
    if (follow) {
      followersLoading = follow.getIn(['getFollowersAsync', account, 'blog_loading'], false);
      followingLoading = follow.getIn(['getFollowingAsync', account, 'blog_loading'], false);
    }
    if (np.follow) {
      npFollowersLoading = np.follow.getIn(['getFollowersAsync', account, 'blog_loading'], false);
      npFollowingLoading = np.follow.getIn(['getFollowingAsync', account, 'blog_loading'], false);
    }

    return (
      np.current_user !== this.props.current_user ||
      np.accounts.get(account) !== this.props.accounts.get(account) ||
      np.wifShown !== this.props.wifShown ||
      np.global_status !== this.props.global_status ||
      ((npFollowersLoading !== followersLoading) && !npFollowersLoading) ||
      ((npFollowingLoading !== followingLoading) && !npFollowingLoading) ||
      np.loading !== this.props.loading ||
      np.location.pathname !== this.props.location.pathname ||
      np.routeParams.accountname !== this.props.routeParams.accountname ||
      np.follow_count !== this.props.follow_count
    )
  }

  componentWillUnmount() {
    this.props.clearTransferDefaults();
    this.props.clearPowerdownDefaults();
  }

  loadMore(last_post, category) {
    const {accountname} = this.props.routeParams;
    if (!last_post) return;

    let order;
    switch (category) {
      case 'feed':
        order = 'by_feed';
        break;
      case 'blog':
        order = 'by_author';
        break;
      case 'comments':
        order = 'by_comments';
        break;
      case 'recent_replies':
        order = 'by_replies';
        break;
      default:
        console.log('unhandled category:', category);
    }

    if (isFetchingOrRecentlyUpdated(this.props.global_status, order, category)) {
      return;
    }
    const [author, permlink] = last_post.split('/');
    this.props.requestData({author, permlink, order, category, accountname});
  }

  render() {
    const {
      props: {current_user, wifShown, global_status, follow},
      onPrint
    } = this;
    let {accountname, section} = this.props.routeParams;
    // normalize account from cased params
    accountname = accountname.toLowerCase();
    const username = current_user ? current_user.get('username') : null
    // const gprops = this.props.global.getIn( ['props'] ).toJS();
    if (!section) section = 'blog';

    // @user/"posts" is deprecated in favor of "comments" as of oct-2016 (#443)
    if (section == 'posts') section = 'comments';

    // const isMyAccount = current_user ? current_user.get('username') === accountname : false;

    // Loading status
    const status = global_status ? global_status.getIn([section, 'by_author']) : null;
    const fetching = (status && status.fetching) || this.props.loading;

    let account;
    let accountImm = this.props.accounts.get(accountname);
    if (accountImm) {
      account = accountImm.toJS();
    } else if (fetching) {
      return <LoadingIndicator type="circle"/>;
    } else {
      return <div>
        {tt('user_profile.unknown_account')}
      </div>
    }
    const followers = follow && follow.getIn(['getFollowersAsync', accountname]);
    const following = follow && follow.getIn(['getFollowingAsync', accountname]);

    // instantiate following items
    let totalCounts = this.props.follow_count;
    let followerCount = 0;
    let followingCount = 0;

    if (totalCounts && accountname) {
      totalCounts = totalCounts.get(accountname);
      if (totalCounts) {
        totalCounts = totalCounts.toJS();
        followerCount = totalCounts.follower_count;
        followingCount = totalCounts.following_count;
      }
    }

    const rep = repLog10(account.reputation);

    const isMyAccount = username === account.name
    let tab_content = null;

    // const global_status = this.props.global.get('status');


    // let balance_steem = parseFloat(account.balance.split(' ')[0]);
    // let vesting_steem = vestingSmoke(account, gprops).toFixed(2);
    // const steem_balance_str = numberWithCommas(balance_steem.toFixed(2)) + " SMOKE";
    // const power_balance_str = numberWithCommas(vesting_steem) + " SMOKE POWER";
    // const sbd_balance = parseFloat(account.sbd_balance)
    // const sbd_balance_str = numberWithCommas('$' + sbd_balance.toFixed(2));

    let rewardsClass = "", walletClass = "";
    if (section === 'transfers') {
      walletClass = 'active';
      tab_content = (
        <div>
          <div className="row">
            <div className="column">
              <WalletSubMenu account_name={account.name}/>
            </div>
          </div>

          <UserWallet
            account={accountImm}
            showTransfer={this.props.showTransfer}
            showPowerdown={this.props.showPowerdown}
            current_user={current_user}
            withdrawVesting={this.props.withdrawVesting}/>
        </div>
      );
    }
    else if (section === 'curation-rewards') {
      rewardsClass = "active";
      tab_content = (<CurationRewards
        account={account}
        current_user={current_user}
      />)
    }
    else if (section === 'author-rewards') {
      rewardsClass = "active";
      tab_content = (<AuthorRewards
        account={account}
        current_user={current_user}
      />)
    }
    else if (section === 'followers') {
      if (followers && followers.has('blog_result')) {
        tab_content = (<div>
          <UserList
            title={tt('user_profile.followers')}
            account={account}
            users={followers.get('blog_result')}/>
        </div>)
      }
    }
    else if (section === 'followed') {
      if (following && following.has('blog_result')) {
        tab_content = <UserList
          title="Followed"
          account={account}
          users={following.get('blog_result')}
        />
      }
    }
    else if (section === 'settings') {
      tab_content = <Settings routeParams={this.props.routeParams}/>
    }
    else if (section === 'comments' && account.post_history) {
      if (account.comments) {
        let posts = accountImm.get('comments');
        if (!fetching && (posts && !posts.size)) {
          tab_content = <Callout>{tt('user_profile.user_hasnt_made_any_posts_yet', {name: accountname})}</Callout>;
        } else {
          tab_content = (
            <PostsList
              posts={posts}
              loading={fetching}
              category="comments"
              loadMore={this.loadMore}
              showSpam
            />
          );
        }
      } else {
        tab_content = (<center><LoadingIndicator type="circle"/></center>);
      }

    } else if (!section || section === 'blog') {
      if (account.blog) {
        let posts = accountImm.get('blog');
        const emptyText = isMyAccount ? <div>
            {tt('user_profile.looks_like_you_havent_posted_anything_yet')}<br/><br/>
            <Link to="/post">{tt('user_profile.create_a_post')}</Link><br/>
            <Link to="/trending">{tt('user_profile.explore_trending_articles')}</Link><br/>
          </div> :
          tt('user_profile.user_hasnt_started_bloggin_yet', {name: accountname});

        if (!fetching && (posts && !posts.size)) {
          tab_content = <Callout>{emptyText}</Callout>;
        } else {
          tab_content = (
            <PostsGrid
              account={account.name}
              posts={posts}
              loading={fetching}
              category="blog"
              loadMore={this.loadMore}
              showSpam
            />
          );
        }
      } else {
        tab_content = (<LoadingIndicator type="circle"/>);
      }
    }
    else if ((section === 'recent-replies')) {
      if (account.recent_replies) {
        let posts = accountImm.get('recent_replies');
        if (!fetching && (posts && !posts.size)) {
          tab_content =
            <Callout>{tt('user_profile.user_hasnt_had_any_replies_yet', {name: accountname}) + '.'}</Callout>;
        } else {
          tab_content = (
            <div>
              <PostsList
                posts={posts}
                loading={fetching}
                category="recent_replies"
                loadMore={this.loadMore}
                showSpam={false}
              />
            </div>
          );
        }
      } else {
        tab_content = (<center><LoadingIndicator type="circle"/></center>);
      }
    }
    else if (section === 'permissions' && isMyAccount) {
      walletClass = 'active'
      tab_content = <div>
        <div className="row">
          <div className="column">
            <WalletSubMenu account_name={account.name}/>
          </div>
        </div>
        <br/>
        <UserKeys account={accountImm}/>
      </div>;
    } else if (section === 'password') {
      walletClass = 'active'
      tab_content = <div>
        <div className="row">
          <div className="column">
            <WalletSubMenu account_name={account.name}/>
          </div>
        </div>
        <br/>
        <PasswordReset account={accountImm}/>
      </div>
    } else {
      //    console.log( "no matches" );
    }

    // detect illegal users
    if (userIllegalContent.includes(accountname)) {
      tab_content = <div>Unavailable For Legal Reasons.</div>;
    }

    if (!(section === 'transfers' || section === 'permissions' || section === 'password')) {
      tab_content = <div className="row">
        <div className="UserProfile__tab_content layout-list column">
          <article className="articles">
            {tab_content}
          </article>
        </div>
      </div>;
    }

    let printLink = null;
    if (section === 'permissions') {
      if (isMyAccount && wifShown) {
        printLink = <div><a className="float-right noPrint" onClick={onPrint}>
          <Icon name="printer"/>&nbsp;{tt('g.print')}&nbsp;&nbsp;
        </a></div>
      }
    }

    // const wallet_tab_active = section === 'transfers' || section === 'password' || section === 'permissions' ? 'active' : ''; // className={wallet_tab_active}

    let rewardsMenu = [
      {
        link: `/@${accountname}/curation-rewards`,
        label: tt('g.curation_rewards'),
        value: tt('g.curation_rewards')
      },
      {link: `/@${accountname}/author-rewards`, label: tt('g.author_rewards'), value: tt('g.author_rewards')}
    ];

    // set account join date
    let accountjoin = account.created;

    const top_menu = <div className="row UserProfile__top-menu">
      <div className="columns small-10 medium-12 medium-expand">
        <ul className="menu" style={{flexWrap: "wrap"}}>
          <li><Link to={`/@${accountname}`} activeClassName="active">{tt('g.blog')}</Link></li>
          <li><Link to={`/@${accountname}/comments`} activeClassName="active">{tt('g.comments')}</Link></li>
          <li><Link to={`/@${accountname}/recent-replies`} activeClassName="active">
            {tt('g.replies')}
          </Link></li>
          {/*<li><Link to={`/@${accountname}/feed`} activeClassName="active">Feed</Link></li>*/}
          <DropdownMenu
              className={rewardsClass}
              items={rewardsMenu}
              el="li"
              selected={tt('g.rewards')}
              position="right"
          />
        </ul>
      </div>
      <div className="columns shrink">
        <ul className="menu" style={{flexWrap: "wrap"}}>
          <li>
            <a href={`/@${accountname}/transfers`} className={walletClass} onClick={e => {
              e.preventDefault();
              browserHistory.push(e.target.pathname);
              return false;
            }}>
              {tt('g.wallet')}
            </a>
          </li>
          {isMyAccount && <li>
            <Link to={`/@${accountname}/settings`} activeClassName="active">{tt('g.settings')}</Link>
          </li>}
        </ul>
      </div>
    </div>;

    const {name, location, about, website, cover_image} = normalizeProfile(account);
    const website_label = website ? website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : null

    let cover_image_style = {}
    if (cover_image) {
      cover_image_style = {backgroundImage: "url(" + proxifyImageUrl(cover_image, '2048x512') + ")"}
    }

    return (
      <div className="UserProfile">
        <div className="UserProfile__banner row expanded">
          <div className="column">
            <div className="profile_div">
              <div style={{position: "relative"}}>
                <div className="UserProfile__buttons hide-for-small-only">
                  <Follow follower={username} following={accountname}/>
                </div>
              </div>
              <h1>
                <Userpic account={account.name} rep={rep} hideIfDefault/>
                {name || account.name}{' '}
                <Tooltip
                  t={tt('user_profile.this_is_users_reputations_score_it_is_based_on_history_of_votes', {name: accountname})}>
                  <span className="UserProfile__rep">({rep})</span>
                </Tooltip>
              </h1>
              <div className="UserProfile__stats">
              <span><Link
                to={`/@${accountname}`}>{tt('user_profile.post_count', {count: account.post_count || 0})}</Link></span>
                  <span>
                      <Link to={`/@${accountname}/followers`}>{tt('user_profile.follower_count', {count: followerCount})}</Link>
                  </span>

                <span><Link
                  to={`/@${accountname}/followed`}>{tt('user_profile.followed_count', {count: followingCount})}</Link></span>
              </div>
              <div>
                {about && rep > 20 && <p className="UserProfile__bio">{about}</p>}
                <p className="UserProfile__info">
                  {website && rep > 20 && <span><SanitizedLink url={website} text={website_label} /></span>}
                </p>
              </div>
              <div className="UserProfile__buttons_mobile show-for-small-only">
                <Follow follower={username} following={accountname} what="blog"/>
              </div>
            </div>
          </div>
        </div>
        <div className="UserProfile__top-nav row expanded noPrint">
          {top_menu}
        </div>
        <div>
          {printLink}
        </div>
        <div>
          {tab_content}
        </div>
      </div>
    );
  }
}

module.exports = {
  path: '@:accountname(/:section)',
  component: connect(
    state => {
      const wifShown = state.global.get('UserKeys_wifShown')
      const current_user = state.user.get('current')
      // const current_account = current_user && state.global.getIn(['accounts', current_user.get('username')])

      return {
        discussions: state.global.get('discussion_idx'),
        current_user,
        // current_account,
        wifShown,
        loading: state.app.get('loading'),
        global_status: state.global.get('status'),
        accounts: state.global.get('accounts'),
        follow: state.global.get('follow'),
        follow_count: state.global.get('follow_count')
      };
    },
    dispatch => ({
      login: () => {
        dispatch(user.actions.showLogin())
      },
      clearTransferDefaults: () => {
        dispatch(user.actions.clearTransferDefaults())
      },
      showTransfer: (transferDefaults) => {
        dispatch(user.actions.setTransferDefaults(transferDefaults))
        dispatch(user.actions.showTransfer())
      },
      clearPowerdownDefaults: () => {
        dispatch(user.actions.clearPowerdownDefaults())
      },
      showPowerdown: (powerdownDefaults) => {
        console.log('power down defaults:', powerdownDefaults)
        dispatch(user.actions.setPowerdownDefaults(powerdownDefaults))
        dispatch(user.actions.showPowerdown())
      },
      withdrawVesting: ({account, vesting_shares, errorCallback, successCallback}) => {
        const successCallbackWrapper = (...args) => {
          dispatch({type: 'global/GET_STATE', payload: {url: `@${account}/transfers`}})
          return successCallback(...args)
        }
        dispatch(transaction.actions.broadcastOperation({
          type: 'withdraw_vesting',
          operation: {account, vesting_shares},
          errorCallback,
          successCallback: successCallbackWrapper,
        }))
      },
      requestData: (args) => dispatch({type: 'REQUEST_DATA', payload: args}),
    })
  )(UserProfile)
};
