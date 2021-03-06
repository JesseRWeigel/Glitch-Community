import React from 'react';
import PropTypes from 'prop-types';

import {CurrentUserConsumer} from '../current-user.jsx';
import ProjectResultItem from '../includes/project-result-item.jsx';
import ProjectModel from '../../models/project';
// import Loader from '../includes/loader.jsx';

export class AddTeamProjectPop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      templateProjects: [],
      filteredProjects: [],
      source: 'my-projects', // my-projects, templates
      filterPlaceholder: 'Filter my projects',
      loadingTemplates: false,
      notifyTemplateIsRemixing: false,
    };
    this.onClick = this.onClick.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.filterInputIsBlank = this.filterInputIsBlank.bind(this);
    this.filterInput = React.createRef();
  }

  normalizeTemplateProjects(data) {
    let projects = data.map(project => {
      project.users = [];
      return ProjectModel(project).update(project).asProps();
    });
    return projects;
  }

  updateFilter(query) {
    let projects = [];
    if (this.state.source === 'templates') {
      projects = this.state.templateProjects;
    } else {
      projects = this.props.myProjects;
    }
    let filteredProjects = this.filterProjects(query, projects, this.props.teamProjects);
    this.setState({
      filteredProjects: filteredProjects
    });
  }

  filterProjects(query, projects, teamProjects) {
    query = query.toLowerCase().trim();
    let MAX_PROJECTS = 20;
    let teamProjectIds = teamProjects.map(({id}) => id);
    let availableProjects = projects.filter(
      ({id}) => !teamProjectIds.includes(id)
    );
    let filteredProjects = [];
    if(!query) {
      return availableProjects.splice(0,MAX_PROJECTS);
    }
    for(let project of availableProjects) {
      if(filteredProjects.length > MAX_PROJECTS){
        break;
      }
      let titleMatch = project.domain.toLowerCase().includes(query);
      let descMatch = project.description.toLowerCase().includes(query);
      if(titleMatch || descMatch) {
        filteredProjects.push(project);
      }
    }
    return filteredProjects;
  }

  activeIfSourceIsTemplates() {
    if (this.state.source === 'templates') {
      return 'active';
    }
  }

  activeIfSourceIsMyProjects() {
    if (this.state.source === 'my-projects') {
      return 'active';
    }
  }

  async remixTemplate(projectId) {
    let remixTemplatePath = `projects/${projectId}/remix`;
    return await this.props.api.post(remixTemplatePath);
  }

  async inviteUserToRemix(data) {
    let inviteUserPath = `projects/${data.inviteToken}/join`;
    return await this.props.api.post(inviteUserPath);
  }

  onClick(event, project) {
    event.preventDefault();
    this.props.togglePopover();
    // temp: this code used by adding team templates

    // if (this.state.source === 'templates') {
    // this.setState({
    //   notifyTemplateIsRemixing: true
    // });
    //   this.remixTemplate(projectId)
    //     .then(({data}) => {
    //       console.log ('yolooo' , data);
    //       this.inviteUserToRemix(data)
    //         .then(({data}) => {
    //           console.log ('🚒', data);
    //           // patch? avatar?
    //           this.props.addProject(data.id);
    //         });
    //     });
    // } else {
    // have to be a member before this will work
    this.props.addProject(project);
    // }
  }

  sourceIsTemplates() {
    this.setState({
      source: 'templates',
      filterPlaceholder: 'Filter templates',
    });
  }

  sourceIsMyProjects() {
    this.setState({
      source: 'my-projects',
      filterPlaceholder: 'Filter projects',
    });
  }

  getTemplateProjects() {
    this.setState({
      loadingTemplates: true,
    });
    const templateIds = [
      '9cd48134-1624-48f5-beaf-6c1b68bd9217', // 'timelink'
      '712cc905-bfcb-454e-a47a-c729ab63c455', // 'poller'
      '929980a8-32fc-4ae7-a66f-dddb3ae4912c', // 'hello-webpage'
    ];
    let projectsPath = `projects/byIds?ids=${templateIds.join(',')}`;
    this.props.api.get(projectsPath)
      .then(({data}) => {
        let projects = this.normalizeTemplateProjects(data);
        this.setState({
          templateProjects: projects,
          loadingTemplates: false,
        });
        this.updateFilter('');
      });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.source !== this.state.source) {
      this.updateFilter("");
      this.filterInput.current.focus();
    }
    if (prevState.notifyTemplateIsRemixing !== this.state.notifyTemplateIsRemixing) {
      console.log('📟 time to toggle the `is remixing` notification to', this.state.notifyTemplateIsRemixing);
      // notify.createPersistentNotification(<p>remixing projectName to newname</p>, 'notifyRemixing')
    }
  }

  componentDidMount() {
    this.getTemplateProjects();
    this.filterInput.current.focus();
    this.updateFilter("");
  }
  
  filterInputIsBlank() {
    console.log(this.filterInput.current.value);
    if (this.filterInput.current.value.length === 0) {
      console.log ('sdf');
      return true;
    }
  } 

  render() {
    const filteredProjects = this.state.filteredProjects;

    return (
      <dialog className="pop-over add-team-project-pop">
        <section className="pop-over-info">
          {/* Temporary: hidden for now pending having templates to use
          <div className="segmented-buttons">
            <button
              className={`button-small button-tertiary button-on-secondary ${this.activeIfSourceIsTemplates()}`}
              onClick={this.sourceIsTemplates.bind(this)}
              data-source="templates"
            >
              Templates
            </button>
            <button
              className={`button-small button-tertiary button-on-secondary ${this.activeIfSourceIsMyProjects()}`}
              onClick={this.sourceIsMyProjects.bind(this)}
              data-source="my-projects"
            >
              My Projects
            </button>
          </div>
          */}

          <input
            ref={this.filterInput}
            onChange={(event) => {this.updateFilter(event.target.value);}}
            id="team-project-search" className="pop-over-input search-input pop-over-search"
            placeholder= {this.state.filterPlaceholder}
            autoFocus // eslint-disable-line jsx-a11y/no-autofocus
          />
        </section>

        <section className="pop-over-actions results-list" data-source='templates'>
          {/* Temporary: hidden for now pending having templates to use

          { (this.state.loadingTemplates) &&
            <Loader />
          }
          */}

          <ul className="results">
            { filteredProjects.map((project) => (
              <li key={project.id}>
                <ProjectResultItem
                  action={(event) => this.onClick(event, project)}
                  {...project}
                  title={project.domain}/>
              </li>
            ))}
          </ul>
          { (this.state.filteredProjects.length === 0 && this.filterInputIsBlank) &&
             <p className="action-description no-projects-description">Create or Join projects to add them to the team</p>
          }
        </section>
      </dialog>
    );
  }
}

AddTeamProjectPop.propTypes = {
  myProjects: PropTypes.array.isRequired,
  teamProjects: PropTypes.array.isRequired,
  addProject: PropTypes.func.isRequired,
  togglePopover: PropTypes.func.isRequired,
  api: PropTypes.any.isRequired
};

const AddTeamProjectPopContainer = (props) => (
  <CurrentUserConsumer>
    {currentUser => <AddTeamProjectPop myProjects={currentUser.projects} {...props}/>}
  </CurrentUserConsumer>
);

export default AddTeamProjectPopContainer;
