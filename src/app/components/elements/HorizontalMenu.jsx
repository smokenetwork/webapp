import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router'
import Icon from './Icon';
import TopRightMenu from './../modules/TopRightMenu';

export default class HorizontalMenu extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    title: PropTypes.string,
    className: PropTypes.string,
    hideValue: PropTypes.string,
  };

  render() {
    const {items, title, className, hideValue} = this.props;
    return <ul className={'HorizontalMenu menu' + (className ? ' ' + className : '')}>
      {title && <li className="title">{title}</li>}
      {items.map(i => {
        if (i.value === hideValue) return null
        return <li key={i.value} className={i.active ? 'active hide-for-small-only' : 'hide-for-small-only'}>
          {i.link ? <Link to={i.link} onClick={i.onClick}>
              {i.icon && <Icon name={i.icon}/>}{i.label ? i.label : i.value}
            </Link> :
            <span>
                        {i.icon && <Icon name={i.icon}/>}{i.label ? i.label : i.value}
                    </span>
          }
        </li>
      })}
      <li>
        <TopRightMenu {...this.props} />
      </li>
    </ul>;
  }
}
