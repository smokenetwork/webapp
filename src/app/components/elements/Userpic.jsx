import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import shouldComponentUpdate from '../../utils/shouldComponentUpdate';
import {imageProxy} from '../../utils/ProxifyUrl';

export const SIZE_SMALL = 'small';
export const SIZE_MED = 'medium';
export const SIZE_LARGE = 'large';

const sizeList = [SIZE_SMALL, SIZE_MED, SIZE_LARGE]

export const avatarSize = {
    small: SIZE_SMALL,
    medium: SIZE_MED,
    large: SIZE_LARGE
};

class Userpic extends Component {

    shouldComponentUpdate = shouldComponentUpdate(this, 'Userpic')

    render() {
        const {account, json_metadata, size} = this.props
        const hideIfDefault = this.props.hideIfDefault || false
        const avSize = (size && sizeList.indexOf(size) > -1) ? '/' + size : '';
        let profileImageUrl = `u/${account}/avatar${avSize}`;

        // try to extract image url from users metaData
        if (hideIfDefault) {
            try {
                const md = JSON.parse(json_metadata);
                if (md.profile.profile_image) {
                    if (/^(https?:)\/\//.test(md.profile.profile_image)) {
                        // hack to get profile images to display. This doesn't work if there is no metadata
                        profileImageUrl = `0x0/${md.profile.profile_image}`;
                    }
                }
            } catch (e) {
                return null;
            }
        }

        const style = {backgroundImage: `url(${imageProxy()}${profileImageUrl})`};

        return (<div className="Userpic" style={style}/>)
    }
}

Userpic.propTypes = {
    account: PropTypes.string.isRequired
}

export default connect(
    (state, ownProps) => {
        const {account, hideIfDefault} = ownProps
        return {
            account,
            json_metadata: state.global.getIn(['accounts', account, 'json_metadata']),
            hideIfDefault,
        }
    }
)(Userpic)
