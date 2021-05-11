import React from 'react'
import PropTypes from 'prop-types';
import {Link} from 'react-router'
import Icon from './Icon';

export default class ShareMenu extends React.Component {

  static propTypes = {
    menu: PropTypes.arrayOf(PropTypes.object).isRequired,
    title: PropTypes.string
  };

  render() {
    const title = this.props.title;
    const items = this.props.menu;
    return <span className={"shareMenu"}>
            <div className={'shareItems'}>
            {title && <div className="title">{title}</div>}
              {items.map(i => {
                return <div  key={i.value}>
                  {i.link ? <Link to={i.link} onClick={i.onClick} title={i.title}>
                      {i.icon && <Icon name={i.icon}/>}{}
                      &nbsp; {i.addon}
                    </Link> :
                    <span>
                        {i.icon && <Icon name={i.icon}/>}{i.label ? i.label : i.value}
                    </span>
                  }
                </div >
              })}
            </div>
        </span>
  }
}
