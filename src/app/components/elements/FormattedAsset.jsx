import React from 'react';
import Icon from './Icon';
import {formatDecimal, parsePayoutAmount} from '../../utils/ParsersAndFormatters';

const FormattedAsset = ({amount, asset, classname}) => {
  if (amount && typeof(amount) === 'string') {
    amount = parsePayoutAmount(amount);
  }
  const amnt = formatDecimal(amount);
  return asset === '$' ?
    <span className={`FormattedAsset ${classname}`}>
            {/*<span className="prefix">$</span>*/}
      <Icon name="smoke"/>
            <span className="integer">{amnt[0]}</span>
            <span className="decimal">{amnt[1]}</span>
        </span> :
    <span className="FormattedAsset"><span className="integer">{amnt[0]}</span><span
      className="decimal">{amnt[1]}</span> <span className="asset">{asset}</span></span>;
};

export default FormattedAsset;
