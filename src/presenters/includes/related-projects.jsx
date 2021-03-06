import React from 'react';
import PropTypes from 'prop-types';
import {sampleSize, difference} from 'lodash';

import ProjectModel from '../../models/project';
import {getProfileStyle as getTeamProfileStyle} from '../../models/team';
import {getDisplayName, getProfileStyle as getUserProfileStyle} from '../../models/user';

import {DataLoader} from './loader.jsx';
import {CoverContainer} from './profile.jsx';
import {TeamLink, UserLink} from './link.jsx';
import {ProjectsUL} from '../projects-list.jsx';

const PROJECT_COUNT = 3;

const RelatedProjectsBody = ({projects, coverStyle}) => (
  projects.length ? (
    <CoverContainer style={coverStyle} className="projects">
      <ProjectsUL projects={projects}/>
    </CoverContainer>
  ) : null
);
RelatedProjectsBody.propTypes = {
  projects: PropTypes.array.isRequired,
};

class RelatedProjects extends React.Component {
  constructor(props) {
    super(props);
    const teams = sampleSize(props.teams, 1);
    const users = sampleSize(props.users, 2 - teams.length);
    this.state = {teams, users};
  }
  
  async getProjects(id, getPins, getAllProjects) {
    const pins = await getPins(id);
    const pinIds = pins.map(pin => pin.projectId);
    let ids = sampleSize(difference(pinIds, [this.props.ignoreProjectId]), PROJECT_COUNT);

    if (ids.length < PROJECT_COUNT) {
      const {projects} = await getAllProjects(id);
      const allIds = projects.map(({id}) => id);
      const remainingIds = difference(allIds, [this.props.ignoreProjectId, ...ids]);
      ids = [...ids, ...sampleSize(remainingIds, PROJECT_COUNT - ids.length)];
    }

    if (ids.length) {
      const {data} = await this.props.api.get(`projects/byIds?ids=${ids.join(',')}`);
      return data.map(d => ProjectModel(d).update(d).asProps());
    }
    return [];
  }
  
  render() {
    const {api} = this.props;
    const getTeam = (id) => api.get(`teams/${id}`).then(({data}) => data);
    const getTeamPins = (id) => api.get(`teams/${id}/pinned-projects`).then(({data}) => data);
    const getUser = (id) => api.get(`users/${id}`).then(({data}) => data);
    const getUserPins = (id) => api.get(`users/${id}/pinned-projects`).then(({data}) => data);
    const {teams, users} = this.state;
    if (!teams.length && !users.length) {
      return null;
    }
    return (
      <ul className="related-projects">
        {teams.map(team => (
          <li key={team.id}>
            <h2><TeamLink team={team}>More by {team.name} →</TeamLink></h2>
            <DataLoader get={() => this.getProjects(team.id, getTeamPins, getTeam)}>
              {projects => <RelatedProjectsBody projects={projects} coverStyle={getTeamProfileStyle(team)}/>}
            </DataLoader>
          </li>
        ))}
        {users.map(user => (
          <li key={user.id}>
            <h2><UserLink user={user}>More by {getDisplayName(user)} →</UserLink></h2>
            <DataLoader get={() => this.getProjects(user.id, getUserPins, getUser)}>
              {projects => <RelatedProjectsBody projects={projects} coverStyle={getUserProfileStyle(user)}/>}
            </DataLoader>
          </li>
        ))}
      </ul>
    );
  }
}
RelatedProjects.propTypes = {
  api: PropTypes.any.isRequired,
  ignoreProjectId: PropTypes.string.isRequired,
  teams: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
};

export default RelatedProjects;