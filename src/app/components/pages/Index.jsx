import React from 'react';
import SvgImage from '../elements/SvgImage';
import {translateHtml} from '../../Translator';

export default class Index extends React.Component {
  constructor(params) {
    super(params);
    this.state = {
      submitted: false,
      error: ''
    };
  }

  render() {
    return (
      <div className="Index">
        <div className="text-center">
          <SvgImage name="smoke" width="480px" height="240px"/>
        </div>
        <h1 className="center text-center">
          {translateHtml('APP_NAME_is_a_social_media_platform_where_everyone_gets_paid_for_creating_and_curating_content')}.
        </h1>
        <br/>
        <br/>
      </div>
    );
  }
};
