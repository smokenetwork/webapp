import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {imageProxy} from '../../utils/ProxifyUrl';
import shouldComponentUpdate from '../../utils/shouldComponentUpdate';

export const SIZE_SMALL = 'small';
export const SIZE_MED = 'medium';
export const SIZE_LARGE = 'large';
// TODO this should be configurable
export const PROFILE_IMAGE_URL_PREFIX = 'https://smoke.io/profileimage';

export const avatarSize = {
  small: SIZE_SMALL,
  medium: SIZE_MED,
  large: SIZE_LARGE
};

class Userpic extends Component {

  shouldComponentUpdate = shouldComponentUpdate(this, 'Userpic');

  render() {
    const {json_metadata, account, rep} = this.props;

    if ((typeof(account) === "undefined") || (account === null) || (account === '')) {
      return null;
    }

    let profileImageUrl = `/images/smoke_user.png`;

    // try to extract image url from users metaData
    try {
      const metadata = JSON.parse(json_metadata);
      if (rep >= 20 && metadata.profile.profile_image) {
        if (/^(https?:)\/\//.test(metadata.profile.profile_image)) {
          // hack to get profile images to display. This doesn't work if there is no metadata
          profileImageUrl = `${imageProxy()}64x64/${metadata.profile.profile_image}`;
        }
      }
    } catch (error) {
      // commented out to hide invalid profile pics
      //profileImageUrl = `${PROFILE_IMAGE_URL_PREFIX}/${account}`;
    }

    return (<div className="Userpic" style={{backgroundImage: `url(${profileImageUrl})`}}/>)
  }
}

Userpic.propTypes = {
  account: PropTypes.string.isRequired,
  rep: PropTypes.number.isRequired,
};

export default connect(
  (state, ownProps) => {
    const {account, hideIfDefault} = ownProps;
    return {
      account,
      json_metadata: state.global.getIn(['accounts', account, 'json_metadata']),
      hideIfDefault,
    }
  }
)(Userpic)
