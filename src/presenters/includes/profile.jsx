import React from 'react';
import PropTypes from 'prop-types';


// Image Buttons

export const ImageButtons = ({name, uploadImage, clearImage}) => {
  return (
    <div className="upload-image-buttons">
      { !!uploadImage && (
        <button className="button button-small button-tertiary" onClick={uploadImage}>
          Upload {name}
        </button>
      )}
      { !!clearImage && (
        <button className="button button-small button-tertiary" onClick={clearImage}>
          Clear {name} 
        </button>
      )}
    </div>
  );
};
ImageButtons.propTypes = {
  name: PropTypes.string.isRequired,
  uploadImage: PropTypes.func,
  clearImage: PropTypes.func,
};


// Project Info Container

export const ProjectInfoContainer = ({
  style,
  children,
  buttons,
}) => (
  <React.Fragment>
    <div className="avatar-container">
      <div className="user-avatar" style={style} />
      {buttons}
    </div>
    <div className="profile-information">
      {children}
    </div>
  </React.Fragment>
);
ProjectInfoContainer.propTypes = {
  style: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  buttons: PropTypes.element,
};


// Info Container (generic)

export const InfoContainer = ({children}) => (
  <div className="profile-info">
    {children}
  </div>
);
InfoContainer.propTypes = {
  children: PropTypes.node.isRequired,
};


// Cover Container

export const CoverContainer = ({
  buttons, children, className, ...props
}) => (
  <div className={`cover-container ${className}`} {...props}>
    {children}
    {buttons}
  </div>
);
CoverContainer.propTypes = {
  buttons: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
CoverContainer.defaultProps = {
  className: '',
};


// Profile Container

export const ProfileContainer = ({
  avatarStyle, avatarButtons,
  coverStyle, coverButtons,
  children,
}) => (
  <CoverContainer style={coverStyle} buttons={coverButtons}>
    <InfoContainer>
      <div className="avatar-container">
        <div className="user-avatar" style={avatarStyle} />
        {avatarButtons}
      </div>
      <div className="profile-information">
        {children}
      </div>
    </InfoContainer>
  </CoverContainer>
);
 
