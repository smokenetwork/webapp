/* eslint react/prop-types: 0 */
import React from 'react';
import {connect} from 'react-redux'
import {Link} from 'react-router'
import g from '../../redux/GlobalReducer'
import TransferHistoryRow from '../cards/TransferHistoryRow';
import TransactionError from '../elements/TransactionError';
import TimeAgoWrapper from '../elements/TimeAgoWrapper';
import {delegatedSmoke, numberWithCommas, vestingSmoke} from '../../utils/StateFunctions'
import FoundationDropdownMenu from '../elements/FoundationDropdownMenu'
import WalletSubMenu from '../elements/WalletSubMenu'
import shouldComponentUpdate from '../../utils/shouldComponentUpdate';
import Tooltip from '../elements/Tooltip'
import {FormattedHTMLMessage} from '../../Translator';
import tt from 'counterpart';
import {List} from 'immutable'
import { LIQUID_TOKEN, VESTING_TOKEN} from '../../client_config';
import transaction from '../../redux/Transaction';

// const assetPrecision = 1000;

class UserWallet extends React.Component {
    constructor() {
        super();
        this.state = {
            claimInProgress: false,
        };
        // this.onShowDepositSmoke = (e) => {
        //     if (e && e.preventDefault) e.preventDefault();
        //     const name = this.props.current_user.get('username');
        //     const new_window = window.open();
        //     new_window.opener = null;
        //     // new_window.location = 'https://blocktrades.us/?input_coin_type=btc&output_coin_type=steem&receive_address=' + name;
        // };
        // this.onShowWithdrawSmoke = (e) => {
        //     e.preventDefault();
        //     const new_window = window.open();
        //     new_window.opener = null;
        //     // new_window.location = 'https://blocktrades.us/unregistered_trade/steem/btc';
        // };
        this.onShowDepositPower = (current_user_name, e) => {
            // e.preventDefault();
            // const new_window = window.open();
            // new_window.opener = null;
            // new_window.location = 'https://blocktrades.us/?input_coin_type=btc&output_coin_type=steem_power&receive_address=' + current_user_name;
        };
        this.onShowDepositSBD = (current_user_name, e) => {
            // e.preventDefault();
            // const new_window = window.open();
            // new_window.opener = null;
            // new_window.location = 'https://blocktrades.us/?input_coin_type=btc&output_coin_type=sbd&receive_address=' + current_user_name;
        };
        this.onShowWithdrawSBD = (e) => {
            // e.preventDefault();
            // const new_window = window.open();
            // new_window.opener = null;
            // new_window.location = 'https://blocktrades.us/unregistered_trade/sbd/btc';
        };
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'UserWallet');
    }

    handleClaimRewards = (account) => {
        this.setState({claimInProgress: true}); // disable the claim button
        this.props.claimRewards(account);
    }

    render() {
        // const { onShowDepositSmoke, onShowWithdrawSmoke, onShowDepositPower } = this;
        const { account, current_user } = this.props;
        const gprops = this.props.gprops.toJS();

        if (!account) return null;
        let vesting_steem = vestingSmoke(account.toJS(), gprops);
        let delegated_steem = delegatedSmoke(account.toJS(), gprops);

        let isMyAccount = current_user && current_user.get('username') === account.get('name');

        const disabledWarning = false;
        // isMyAccount = false; // false to hide wallet transactions

        const showTransfer = (asset, transferType, e) => {
            e.preventDefault();
            this.props.showTransfer({
                to: (isMyAccount ? null : account.get('name')),
                asset, transferType
            });
        };

        const powerDown = (cancel, e) => {
            e.preventDefault()
            const name = account.get('name');
            if (cancel) {
                const vesting_shares = cancel ? '0.000000 VESTS' : account.get('vesting_shares');
                this.setState({toggleDivestError: null});
                const errorCallback = e2 => {
                    this.setState({toggleDivestError: e2.toString()})
                };
                const successCallback = () => {
                    this.setState({toggleDivestError: null})
                }
                this.props.withdrawVesting({account: name, vesting_shares, errorCallback, successCallback})
            } else {
                const to_withdraw = account.get('to_withdraw')
                const withdrawn = account.get('withdrawn')
                const vesting_shares = account.get('vesting_shares')
                const delegated_vesting_shares = account.get('delegated_vesting_shares')
                this.props.showPowerdown({
                    account: name,
                    to_withdraw, withdrawn,
                    vesting_shares, delegated_vesting_shares,
                });
            }
        }

        const balance_steem = parseFloat(account.get('balance').split(' ')[0]);
        const divesting = parseFloat(account.get('vesting_withdraw_rate').split(' ')[0]) > 0.000000;

        /// transfer log
        let idx = 0;
        const transfer_log = account.get('transfer_history')
            .map(item => {
                const data = item.getIn([1, 'op', 1]);
                const type = item.getIn([1, 'op', 0]);

                // Filter out rewards
                if (type === "curation_reward" || type === "author_reward" || type === "comment_benefactor_reward") {
                    return null;
                }

                if (data.vesting_payout === '0.000000 VESTS')
                    return null
                return <TransferHistoryRow key={idx++} op={item.toJS()} context={account.get('name')}/>;
            }).filter(el => !!el).reverse();

        let steem_menu = [
            {value: tt('g.transfer'), link: '#', onClick: showTransfer.bind(this, 'SMOKE', 'Transfer to Account')},
            {
                value: tt('userwallet_jsx.power_up'),
                link: '#',
                onClick: showTransfer.bind(this, 'VESTS', 'Transfer to Account')
            },
        ];

        let power_menu = [
            {value: tt('userwallet_jsx.power_down'), link: '#', onClick: powerDown.bind(this, false)}
        ]

        // if (isMyAccount) {
            // steem_menu.push({
            //     value: tt('g.buy'),
            //     link: '#',
            //     onClick: onShowDepositSmoke.bind(this, current_user.get('username'))
            // });
            // steem_menu.push({value: tt('g.sell'), link: '#', onClick: onShowWithdrawSmoke});
            // steem_menu.push({value: tt('userwallet_jsx.market'), link: '/market'});
            // power_menu.push({
            //     value: tt('g.buy'),
            //     link: '#',
            //     onClick: onShowDepositPower.bind(this, current_user.get('username'))
            // })
        // }
        if (divesting) {
            power_menu.push({value: 'Cancel Power Down', link: '#', onClick: powerDown.bind(this, true)});
        }

        // const isWithdrawScheduled = new Date(account.get('next_vesting_withdrawal') + 'Z').getTime() > Date.now()
        const steem_balance_str = numberWithCommas(balance_steem.toFixed(3));
        const power_balance_str = numberWithCommas(vesting_steem.toFixed(3));
        const received_power_balance_str = (delegated_steem < 0 ? '+' : '') + numberWithCommas((-delegated_steem).toFixed(3));
        const reward_steem = parseFloat(account.get('reward_steem_balance').split(' ')[0]) > 0 ? account.get('reward_steem_balance') : null;
        const reward_sp = parseFloat(account.get('reward_vesting_steem').split(' ')[0]) > 0 ? account.get('reward_vesting_steem').replace('SMOKE', 'SP') : null;

        let rewards = [];
        if (reward_steem) rewards.push(reward_steem);
        if (reward_sp) rewards.push(reward_sp);

        let rewards_str;
        switch (rewards.length) {
            case 3:
                rewards_str = `${rewards[0]}, ${rewards[1]} and ${rewards[2]}`;
                break;
            case 2:
                rewards_str = `${rewards[0]} and ${rewards[1]}`;
                break;
            case 1:
                rewards_str = `${rewards[0]}`;
                break;
        }

        let claimbox;
        if (current_user && rewards_str && isMyAccount) {
            claimbox = <div className="row">
                <div className="columns small-12">
                    <div className="UserWallet__claimbox">
                        <span className="UserWallet__claimbox-text">Your current rewards: {rewards_str}</span>
                        <button disabled={this.state.claimInProgress} className="button" onClick={e => {
                            this.handleClaimRewards(account)
                        }}>{tt('userwallet_jsx.redeem_rewards')}</button>
                    </div>
                </div>
            </div>
        }

        return (<div className="UserWallet">
            {claimbox}
            <div className="UserWallet__balance row">
                <div className="column small-12 medium-8">
                    SMOKE
                    <FormattedHTMLMessage className="secondary" id="tips_js.liquid_token" params={{LIQUID_TOKEN, VESTING_TOKEN}}/>
                </div>
                <div className="column small-12 medium-4">
                    {isMyAccount ?
                        <FoundationDropdownMenu className="Wallet_dropdown" dropdownPosition="bottom"
                                                dropdownAlignment="right" label={steem_balance_str + ' SMOKE'}
                                                menu={steem_menu}/>
                        : steem_balance_str + ' SMOKE'}
                </div>
            </div>
            <div className="UserWallet__balance row zebra">
                <div className="column small-12 medium-8">
                    SMOKE POWER
                    <FormattedHTMLMessage className="secondary" id="tips_js.influence_token"/>
                    {delegated_steem != 0 ? <span
                        className="secondary">{tt('tips_js.part_of_your_steem_power_is_currently_delegated')}</span> : null}
                </div>
                <div className="column small-12 medium-4">
                    {isMyAccount ?
                        <FoundationDropdownMenu className="Wallet_dropdown" dropdownPosition="bottom"
                                                dropdownAlignment="right" label={power_balance_str + ' SMOKE'}
                                                menu={power_menu}/>
                        : power_balance_str + ' SMOKE'}
                    {delegated_steem != 0 ? <div style={{paddingRight: isMyAccount ? "0.85rem" : null}}><Tooltip
                        t="SMOKE POWER delegated to this account">({received_power_balance_str} SMOKE)</Tooltip>
                    </div> : null}
                </div>
            </div>
            {disabledWarning && <div className="row">
                <div className="column small-12">
                    <div className="callout warning">
                        {tt('userwallet_jsx.transfers_are_temporary_disabled')}
                    </div>
                </div>
            </div>}
            <div className="row">
                <div className="column small-12">
                    <hr/>
                </div>
            </div>

            <div className="row">
                <div className="column small-12">
                    {/** history */}
                    <h4>{tt('userwallet_jsx.history')}</h4>
                    <div className="secondary">
                        <span>{tt('transfer_jsx.beware_of_spam_and_phishing_links')}</span>
                    </div>
                    <table>
                        <tbody>
                        {transfer_log}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>);
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const gprops = state.global.get('props');
        return {
            ...ownProps,
            gprops
        }
    },
    // mapDispatchToProps
    dispatch => ({
        claimRewards: (account) => {
            const username = account.get('name')
            const successCallback = () => {
                dispatch({type: 'global/GET_STATE', payload: {url: `@${username}/transfers`}})
            };

            const operation = {
                account: username,
                reward_steem: account.get('reward_steem_balance'),
                reward_vests: account.get('reward_vesting_balance')
            };

            dispatch(transaction.actions.broadcastOperation({
                type: 'claim_reward_balance',
                operation,
                successCallback,
            }))
        },
        convertToSmoke: (e) => {
            e.preventDefault()
            const name = 'convertToSmoke';
            dispatch(g.actions.showDialog({name}))
        },
        showChangePassword: (username) => {
            const name = 'changePassword';
            dispatch(g.actions.remove({key: name}));
            dispatch(g.actions.showDialog({name, params: {username}}))
        },
    })
)(UserWallet)
