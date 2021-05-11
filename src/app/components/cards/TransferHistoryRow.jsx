import React from 'react';
import {connect} from 'react-redux'
import {Link} from 'react-router';
import tt from 'counterpart';
import TimeAgoWrapper from '../elements/TimeAgoWrapper';
// import Icon from '../elements/Icon';
import Memo from '../elements/Memo'
import {numberWithCommas, vestsToSp} from '../../utils/StateFunctions'
import BadActorList from '../../utils/BadActorList';

class TransferHistoryRow extends React.Component {
  render() {
    const {op, context, curation_reward, author_reward, benefactor_reward, powerdown_vests, reward_vests} = this.props;
    // context -> account perspective

    const type = op[1].op[0];
    const data = op[1].op[1];

    /*  all transfers involve up to 2 accounts, context and 1 other. */
    let description_start = "";
    let other_account = null;
    let description_end = "";

    if (type === 'transfer_to_vesting') {
      if (data.from === context) {
        if (data.to === "") {
          description_start += tt('g.transfer') + data.amount.split(' ')[0] + tt('g.to') + "SMOKE POWER";
        }
        else {
          description_start += tt('g.transfer') + data.amount.split(' ')[0] + " SMOKE POWER" + tt('g.to');
          other_account = data.to;
        }
      }
      else if (data.to === context) {
        description_start += tt('g.receive') + data.amount.split(' ')[0] + " SMOKE POWER" + tt('g.from');
        other_account = data.from;
      } else {
        description_start += tt('g.transfer') + data.amount.split(' ')[0] + " SMOKE POWER" + tt('g.from') + data.from + tt('g.to');
        other_account = data.to;
      }
    }
    else if (/^transfer$/.test(type)) {
      const fromWhere = ''

      if (data.from === context) {
        description_start += tt('g.transfer') + `${fromWhere} ${data.amount}` + tt('g.to');
        other_account = data.to;
      }
      else if (data.to === context) {
        description_start += tt('g.receive') + `${fromWhere} ${data.amount}` + tt('g.from');
        other_account = data.from;
      } else {
        description_start += tt('g.transfer') + `${fromWhere} ${data.amount}` + tt('g.from');
        other_account = data.from;
        description_end += tt('g.to') + data.to;
      }
      if (data.request_id != null)
        description_end += ` (${tt('g.request')} ${data.request_id})`
    } else if (type === 'withdraw_vesting') {
      if (data.vesting_shares === '0.000000 VESTS')
        description_start += tt('transferhistoryrow_jsx.stop_power_down');
      else
        description_start += tt('transferhistoryrow_jsx.start_power_down_of') + ' ' + powerdown_vests + " SMOKE";
    } else if (type === 'curation_reward') {
      description_start += `${curation_reward} SMOKE POWER` + tt('g.for');
      other_account = data.comment_author + "/" + data.comment_permlink;
    } else if (type === 'author_reward') {
      let steem_payout = "";
      if (data.steem_payout !== '0.000 SMOKE') steem_payout = ", " + data.steem_payout;
      // description_start += `${data.sbd_payout}${steem_payout}, ${tt('g.and')} ${author_reward} SMOKE POWER ${tt('g.for')} ${data.author}/${data.permlink}`;
      description_start += `${author_reward} SMOKE POWER ${tt('g.for')} ${data.author}/${data.permlink}`;
      // other_account = ``;
      description_end = '';
    } else if (type === 'claim_reward_balance') {
      let rewards = [];
      // if (parseFloat(data.reward_steem.split(' ')[0]) > 0) rewards.push(data.reward_steem);
      if (parseFloat(data.reward_vests.split(' ')[0]) > 0) rewards.push(`${reward_vests} SMOKE POWER`);

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

      description_start += `Claim rewards: ${rewards_str}`;
      description_end = '';
    } else if (type === 'comment_benefactor_reward') {
      let steem_payout = "";
      if (data.steem_payout !== '0.000 SMOKE') steem_payout = ", " + data.steem_payout;
      description_start += `${benefactor_reward} SMOKE POWER for ${data.author}/${data.permlink}`;
      description_end = '';
    } else {
      description_start += JSON.stringify({type, ...data}, null, 2);
    }
    // <Icon name="clock" className="space-right" />
    return (
      <tr key={op[0]} className="Trans">
        <td>
          <TimeAgoWrapper date={op[1].timestamp}/>
        </td>
        <td className="TransferHistoryRow__text" style={{maxWidth: "40rem"}}>
          {description_start}
          {other_account && <Link to={`/@${other_account}`}>{other_account}</Link>}
          {description_end}
        </td>
        <td className="show-for-medium" style={{maxWidth: "40rem", wordWrap: "break-word"}}>
          <Memo
              text={data.memo}
              username={context}
              isFromBadActor={
                  BadActorList.indexOf(other_account) > -1
              }
          />
        </td>
      </tr>
    );
  }
}

export default connect(
  // mapStateToProps
  (state, ownProps) => {
    const op = ownProps.op;
    const type = op[1].op[0];
    const data = op[1].op[1];
    const powerdown_vests = type === 'withdraw_vesting' ? numberWithCommas(vestsToSp(state, data.vesting_shares)) : undefined;
    const reward_vests = type === 'claim_reward_balance' ? numberWithCommas(vestsToSp(state, data.reward_vests)) : undefined;
    const curation_reward = type === 'curation_reward' ? numberWithCommas(vestsToSp(state, data.reward)) : undefined;
    const author_reward = type === 'author_reward' ? numberWithCommas(vestsToSp(state, data.vesting_payout)) : undefined;
    const benefactor_reward = type === 'comment_benefactor_reward' ? numberWithCommas(vestsToSp(state, data.reward)) : undefined;
    return {
      ...ownProps,
      curation_reward,
      author_reward,
      benefactor_reward,
      powerdown_vests,
      reward_vests,
    }
  },
)(TransferHistoryRow)
