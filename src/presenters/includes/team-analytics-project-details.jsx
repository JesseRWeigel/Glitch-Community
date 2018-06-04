import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-mini';

import Loader from './loader.jsx';
const RECENT_REMIXES_COUNT = 100

const getProjectDetails = async ({id, api, currentProjectDomain}) => {
  let path = `analytics/${id}/project/${currentProjectDomain}/overview`;
  try {
    return await api().get(path);
  } catch (error) {
    console.error('getProjectDetails', error);
  }
}

const avatarUrl = (id) => {
  return `https://cdn.glitch.com/project-avatar/${id}.png`
}

const ProjectDetails = ({projectDetails}) => {
  let projectAvatar = avatarUrl(projectDetails.id)
  let projectUrl = `/~${projectDetails.domain}`
  // convert to a paragraph?
  return (
    <article className="project-details">
      <a href={projectUrl}>
        <img className="avatar" src={projectAvatar} />
      </a>
      <p>{projectDetails.description}</p>
      <table>
        <tr>
          <td>Created</td>
          <td>{moment(projectDetails.createdAt).fromNow()}</td>
        </tr>
        <tr>
          <td>Last code view</td>
          <td>{moment(projectDetails.lastAccess).fromNow()}</td>
        </tr>
        <tr>
          <td>Last edited</td>
          <td>{moment(projectDetails.lastEditedAt).fromNow()}</td>
        </tr>
        <tr>
          <td>Last remixed</td>
          <td>{moment(projectDetails.lastRemixedAt).fromNow()}</td>
        </tr>
        <tr>
          <td>Total app views</td>
          <td>{projectDetails.numAppVisits}</td>
        </tr>
        <tr>
          <td>Total code views</td>
          <td>{projectDetails.numUniqueEditorVisits}</td>
        </tr>
        <tr>
          <td>Total direct remixes</td>
          <td>{projectDetails.numDirectRemixes}</td>
        </tr>
        <tr>
          <td>Total remixes</td>
          <td>{projectDetails.numTotalRemixes}</td>
        </tr>
        { (projectDetails.baseProject.domain) &&
          <tr>
            <td>Originally remixed from</td>
            <td>{projectDetails.baseProject.domain}</td>
          </tr>
        }
      </table>
    </article>
  )
}

const ProjectRemixItem = ({remix}) => {
  let projectAvatar = avatarUrl(remix.id)
  let projectUrl = `/~${remix.domain}`
  return (
    <a href={projectUrl}>
      <img className="avatar" src={projectAvatar} alt={remix.domain} dataTooltip={remix.domain} dataTooltipLeft="true"/>
    </a>
  )
}

class TeamAnalyticsProjectDetails extends React.Component {
  constructor(props) {
    super(props);
      this.state = {
      isGettingData: true,
      projectDetails: {},
      projectRemixes: [],
    };
  }

  
  componentDidMount() {
    getProjectDetails(this.props).then(({data}) => {
      this.setState({
        isGettingData: false,
        projectDetails: data,
        projectRemixes: data.remixes.slice(0, RECENT_REMIXES_COUNT),
      }, () => {
        console.log ('update project details', data)
        // <ProjectDetails 
        // />
      });
    });
  }
  
  componentWillUpdate() {
    console.log ('🚗🖼 getProjectOverview: componentWillUpdate', this.props.currentProjectDomain)
    // this.setState({
    //   isGettingData: true,
    // }, () => {
    //   console.log('get data, update deets')
    // });
  }
  
  render() {
    return (
      <React.Fragment>
        { (this.state.isGettingData) &&
          <Loader />
        ||
          <React.Fragment>
            <ProjectDetails 
              projectDetails = {this.state.projectDetails}
            />
            <h4>Latest Remixes</h4>
            { this.state.projectRemixes.map(remix => (
              <ProjectRemixItem
                key = {remix.id}
                remix = {remix}
              />
            ))}
          </React.Fragment>
        }
      </React.Fragment>
    )
  }
};

TeamAnalyticsProjectDetails.propTypes = {
  currentProjectDomain: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  api: PropTypes.func.isRequired,
};

export default TeamAnalyticsProjectDetails;