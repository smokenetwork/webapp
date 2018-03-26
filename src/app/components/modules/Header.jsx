import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import resolveRoute from '../../ResolveRoute';
import shouldComponentUpdate from '../../utils/shouldComponentUpdate';
import HorizontalMenu from '../elements/HorizontalMenu';
import normalizeProfile from '../../utils/NormalizeProfile';
import tt from 'counterpart';
import {APP_NAME} from '../../client_config';
import SvgImage from "../elements/SvgImage";

class Header extends React.Component {
    static propTypes = {
        location: React.PropTypes.object.isRequired,
        current_account_name: React.PropTypes.string,
        account_meta: React.PropTypes.object
    };

    constructor() {
        super();
        this.state = {subheader_hidden: false}
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Header');
        this.hideSubheader = this.hideSubheader.bind(this);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.hideSubheader, {capture: false, passive: true});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location.pathname !== this.props.location.pathname) {
            const route = resolveRoute(nextProps.location.pathname);
            if (route && route.page === 'PostsIndex' && route.params && route.params.length > 0) {
                const sort_order = route.params[0] !== 'home' ? route.params[0] : null;
                if (sort_order) window.last_sort_order = this.last_sort_order = sort_order;
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.hideSubheader);
    }

    hideSubheader() {
        const subheader_hidden = this.state.subheader_hidden;
        const y = window.scrollY >= 0 ? window.scrollY : document.documentElement.scrollTop;
        if (y === this.prevScrollY) return;

        if (y < 5) {
            this.setState({subheader_hidden: false});
        } else if (y > this.prevScrollY) {
            if (!subheader_hidden) this.setState({subheader_hidden: true})
        } else {
            if (subheader_hidden) this.setState({subheader_hidden: false})
        }
        this.prevScrollY = y;
    }

    render() {
        const route = resolveRoute(this.props.location.pathname);
        const current_account_name = this.props.current_account_name;
        let home_account = false;
        let page_title = route.page;

        let sort_order = '';
        let topic = '';
        let user_name = null;
        let page_name = null;
        this.state.subheader_hidden = false;
        if (route.page === 'PostsIndex') {
            sort_order = route.params[0];
            if (sort_order === 'home') {
                page_title = tt('header_jsx.home')
                const account_name = route.params[1];
                if (current_account_name && account_name.indexOf(current_account_name) === 1)
                    home_account = true;
            } else {
                topic = (route.params.length > 1 ? route.params[1] : '')
                const type = (route.params[0] == 'payout_comments' ? 'comments' : 'posts');
                let prefix = route.params[0];
                if (prefix == 'created') prefix = 'New'
                if (prefix == 'payout') prefix = 'Pending payout'
                if (prefix == 'payout_comments') prefix = 'Pending payout'
                if (topic !== '') prefix += ` ${topic}`;
                page_title = `${prefix} ${type}`
            }
        } else if (route.page === 'Post') {
            sort_order = '';
            topic = route.params[0];
        } else if (route.page == 'SubmitPost') {
            page_title = tt('header_jsx.create_a_post');
        } else if (route.page == 'Privacy') {
            page_title = tt('navigation.privacy_policy');
        } else if (route.page == 'Tos') {
            page_title = tt('navigation.terms_of_service');
        } else if (route.page == 'ChangePassword') {
            page_title = tt('header_jsx.change_account_password');
        } else if (route.page == 'CreateAccount') {
            page_title = tt('header_jsx.create_account');
        } else if (route.page == 'PickAccount') {
            page_title = `Pick Your New Steemit Account`;
            this.state.subheader_hidden = true;
        } else if (route.page == 'Approval') {
            page_title = `Account Confirmation`;
            this.state.subheader_hidden = true;
        } else if (route.page == 'RecoverAccountStep1' || route.page == 'RecoverAccountStep2') {
            page_title = tt('header_jsx.stolen_account_recovery');
        } else if (route.page === 'UserProfile') {
            user_name = route.params[0].slice(1);
            const acct_meta = this.props.account_meta.getIn([user_name]);
            const name = acct_meta ? normalizeProfile(acct_meta.toJS()).name : null;
            const user_title = name ? `${name} (@${user_name})` : user_name;
            page_title = user_title;
            if (route.params[1] === "followers") {
                page_title = tt('header_jsx.people_following') + " " + user_title;
            }
            if (route.params[1] === "followed") {
                page_title = tt('header_jsx.people_followed_by') + " " + user_title;
            }
            if (route.params[1] === "curation-rewards") {
                page_title = tt('header_jsx.curation_rewards_by') + " " + user_title;
            }
            if (route.params[1] === "author-rewards") {
                page_title = tt('header_jsx.author_rewards_by') + " " + user_title;
            }
            if (route.params[1] === "recent-replies") {
                page_title = tt('header_jsx.replies_to') + " " + user_title;
            }
            // @user/"posts" is deprecated in favor of "comments" as of oct-2016 (#443)
            if (route.params[1] === "posts" || route.params[1] === "comments") {
                page_title = tt('header_jsx.comments_by') + " " + user_title;
            }
        } else {
            page_name = ''; //page_title = route.page.replace( /([a-z])([A-Z])/g, '$1 $2' ).toLowerCase();
        }

        // Format first letter of all titles and lowercase user name
        if (route.page !== 'UserProfile') {
            page_title = page_title.charAt(0).toUpperCase() + page_title.slice(1);
        }

        if (process.env.BROWSER && (route.page !== 'Post' && route.page !== 'PostNoCategory')) document.title = page_title + ' — ' + APP_NAME;

        const logoLink = route.params && route.params.length > 1 && this.last_sort_order ? '/' + this.last_sort_order : (current_account_name ? `/@${current_account_name}/feed` : '/');

        const menuItems = [
            {
                value: tt('main_menu.explore'),
                link: '/created',
                icon: 'home',
            },
            {
                value: tt('main_menu.wallet'),
                link: `@${current_account_name}/transfers`,
                icon: 'wallet',
            },
        ];

        return (
            <header className="Header noPrint">
                <div className="Header__top header">
                    <div className="expanded row">
                        <div className="columns large-offset-2 large-8">
                            <ul className="menu">
                                <li className="Header__top-logo">
                                    <Link to={logoLink}>
                                        <SvgImage name="smoke" width="148px" height="38px" className="Header__logo"></SvgImage>
                                    </Link>
                                </li>
                                <HorizontalMenu className="align-right" items={menuItems} {...this.props} />
                            </ul>
                        </div>
                    </div>
                </div>
            </header>
        );
    }
}

export {Header as _Header_};

export default connect(
    (state) => {
        const current_user = state.user.get('current');
        const account_user = state.global.get('accounts');
        const current_account_name = current_user ? current_user.get('username') : state.offchain.get('account');
        return {
            location: state.app.get('location'),
            current_account_name,
            account_meta: account_user
        }
    }
)(Header);
