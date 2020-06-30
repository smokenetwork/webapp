import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router'
import Icon from './Icon';

export default class VerticalMobileMenu extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    title: PropTypes.string,
    className: PropTypes.string,
    hideValue: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element
    ]),
  };

  closeMenu = (e) => {
    // If this was not a left click, or if CTRL or CMD were held, do not close the menu.
    if (e.button !== 0 || e.ctrlKey || e.metaKey) return;

    // Simulate clicking of document body which will close any open menus
    document.body.click();
  }

  render() {
    const {items, title, className, hideValue} = this.props;
    return <div className={'VerticalMobileMenu menu vertical' + (className ? ' ' + className : '')}>
      {title && <div className="tops"><div className="title float-left">{title}</div><div onClick={this.closeMenu} className="title float-right">X</div></div>}
      {
        items.map(i => {
          if (i.value === hideValue) return null
          return <Link to={i.link} className="menuItems" key={i.value} >
            {
              i.link
                ? <div className="divpad"
                     onClick={ (e) => {
                       if (i.onClick) {
                         i.onClick();
                       } else {
                         this.closeMenu(e);
                       }
                    }}
                  >
                    <div className="alignments">
                      {i.icon && <Icon name={i.icon}/>}{i.label ? i.label : i.value}
                      {i.addon}
                    </div>
                  </div>
                : <span>{i.icon && <Icon name={i.icon}/>}{i.label ? i.label : i.value}</span>
            }
          </Link>
        })
      }
    </div>;
  }
}
