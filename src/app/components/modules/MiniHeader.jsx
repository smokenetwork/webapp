import React from 'react';

export default function MiniHeader() {
    return <header className="Header">
        <div className="Header__top header">
            <div className="expanded row">
                <div className="columns">
                    <ul className="menu">
                        <li className="Header__top-logo">
                            <a href="/">

                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </header>;
}
