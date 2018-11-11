import React from 'react';
import {Link} from 'react-router';
import SvgImage from '../elements/SvgImage';

export default function MiniHeader() {
  return <header className="Header">
    <div className="Header__top header">
      <div className="expanded row">
        <div className="columns">
          <ul className="menu">
            <li className="Header__top-logo">
              <Link to="/">
                <SvgImage name="smoke" width="148px" height="38px" className="Header__logo"></SvgImage>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>;
}
