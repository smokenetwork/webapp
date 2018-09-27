import React from 'react';
import {connect} from 'react-redux';
import CloseButton from 'react-foundation-components/lib/global/close-button';
import Reveal from 'react-foundation-components/lib/global/reveal';
import LoginForm from './LoginForm';
import ConfirmTransactionForm from './ConfirmTransactionForm';
import Transfer from './Transfer';
import SignUp from './SignUp';
import user from '../../redux/User';
import Powerdown from './Powerdown';
import tr from '../../redux/Transaction';
import shouldComponentUpdate from '../../utils/shouldComponentUpdate';
import {NotificationStack} from 'react-notification';
import TermsAgree from './TermsAgree';
import EligibleDialog from './EligibleDialog';

class Modals extends React.Component {
    static propTypes = {
        show_login_modal: React.PropTypes.bool,
        show_confirm_modal: React.PropTypes.bool,
        show_transfer_modal: React.PropTypes.bool,
        show_powerdown_modal: React.PropTypes.bool,
        show_signup_modal: React.PropTypes.bool,
        show_promote_post_modal: React.PropTypes.bool,
        hideLogin: React.PropTypes.func.isRequired,
        hideConfirm: React.PropTypes.func.isRequired,
        hideSignUp: React.PropTypes.func.isRequired,
        hideTransfer: React.PropTypes.func.isRequired,
        hidePowerdown: React.PropTypes.func.isRequired,
        notifications: React.PropTypes.object,
        show_terms_modal: React.PropTypes.bool,
        show_eligible_modal: React.PropTypes.bool,
        removeNotification: React.PropTypes.func,
    };

    constructor() {
        super();
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Modals');
    }

    render() {
        const {
            show_login_modal, show_confirm_modal, show_transfer_modal, show_powerdown_modal, show_signup_modal,
            hideLogin, hideTransfer, hidePowerdown, hideConfirm, hideSignUp, show_terms_modal, show_eligible_modal,
            notifications, removeNotification
        } = this.props;

        const notifications_array = notifications ? notifications.toArray().map(n => {
            n.onClick = () => removeNotification(n.key);
            return n;
        }) : [];

        return (
            <div>
                {show_login_modal && <Reveal onHide={hideLogin} show={show_login_modal}>
                    <LoginForm onCancel={hideLogin}/>
                </Reveal>}
                {show_confirm_modal && <Reveal onHide={hideConfirm} show={show_confirm_modal}>
                    <CloseButton onClick={hideConfirm}/>
                    <ConfirmTransactionForm onCancel={hideConfirm}/>
                </Reveal>}
                {show_transfer_modal && <Reveal onHide={hideTransfer} show={show_transfer_modal}>
                    <CloseButton onClick={hideTransfer}/>
                    <Transfer/>
                </Reveal>}
                {show_powerdown_modal && <Reveal onHide={hidePowerdown} show={show_powerdown_modal}>
                    <CloseButton onClick={hidePowerdown}/>
                    <Powerdown/>
                </Reveal>}
                {show_signup_modal && <Reveal onHide={hideSignUp} show={show_signup_modal}>
                    <CloseButton onClick={hideSignUp}/>
                    <SignUp/>
                </Reveal>}
                {show_terms_modal && <Reveal show={show_terms_modal}>
                    <TermsAgree onCancel={hideLogin}/>
                </Reveal>}
                {show_eligible_modal && <Reveal show={show_eligible_modal}>
                    <EligibleDialog />
                </Reveal>}
                <NotificationStack
                    style={false}
                    notifications={notifications_array}
                    onDismiss={n => removeNotification(n.key)}
                />
            </div>
        );
    }
}

export default connect(
    state => {
        let show_eligible_modal = false;
        if (process.env.BROWSER && (window.location.pathname !== '/tos.html') && (window.location.pathname !== '/privacy.html')) {
            if (localStorage.getItem("user/show_eligible_modal") === null) {
                show_eligible_modal = true;
            }
        }

        return {
            show_login_modal: state.user.get('show_login_modal'),
            show_confirm_modal: state.transaction.get('show_confirm_modal'),
            show_transfer_modal: state.user.get('show_transfer_modal'),
            show_powerdown_modal: state.user.get('show_powerdown_modal'),
            show_promote_post_modal: state.user.get('show_promote_post_modal'),
            show_signup_modal: state.user.get('show_signup_modal'),
            notifications: state.app.get('notifications'),
            show_terms_modal: state.user.get('show_terms_modal'),
            show_eligible_modal: show_eligible_modal
        }
    },
    dispatch => ({
        hideLogin: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.hideLogin())
        },
        hideConfirm: e => {
            if (e) e.preventDefault();
            dispatch(tr.actions.hideConfirm())
        },
        hideTransfer: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.hideTransfer())
        },
        hidePowerdown: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.hidePowerdown())
        },
        hideSignUp: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.hideSignUp())
        },
        // example: addNotification: ({key, message}) => dispatch({type: 'ADD_NOTIFICATION', payload: {key, message}}),
        removeNotification: (key) => dispatch({type: 'REMOVE_NOTIFICATION', payload: {key}})
    })
)(Modals)
