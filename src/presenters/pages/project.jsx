/* global analytics */

import React from 'react';
import PropTypes from 'prop-types';

import Helmet from 'react-helmet';
import Project, {getAvatarUrl} from '../../models/project';

import {DataLoader} from '../includes/loader.jsx';
import NotFound from '../includes/not-found.jsx';
import {Markdown} from '../includes/markdown.jsx';
import ProjectEditor from '../project-editor.jsx';
import Expander from '../includes/expander.jsx';
import EditableField from '../includes/editable-field.jsx';
import {AuthDescription} from '../includes/description-field.jsx';
import {InfoContainer, ProjectInfoContainer} from '../includes/profile.jsx';
import {ShowButton, EditButton, RemixButton, ReportButton} from '../includes/project-actions.jsx';
import UsersList from '../users-list.jsx';
import RelatedProjects from '../includes/related-projects.jsx';

import Layout from '../layout.jsx';

function trackRemix(id, domain) {
  analytics.track("Click Remix", {
    origin: "project page",
    baseProjectId: id,
    baseDomain: domain,
  });
}

function syncPageToDomain(domain) {
  history.replaceState(null, null, `/~${domain}`);
}

const PrivateTooltip = "Only members can view code";
const PublicTooltip = "Visible to everyone";

const PrivateBadge = () => (
  <span className="project-badge private-project-badge" aria-label={PrivateTooltip} data-tooltip={PrivateTooltip}></span>
);

const PrivateToggle = ({isPrivate, setPrivate}) => {
  const tooltip = isPrivate ? PrivateTooltip : PublicTooltip;
  const classBase = "button-tertiary button-on-secondary-background project-badge";
  const className = isPrivate ? 'private-project-badge' : 'public-project-badge';
  return (
    <span data-tooltip={tooltip}>
      <button aria-label={tooltip}
        onClick={() => setPrivate(!isPrivate)}
        className={`${classBase} ${className}`}
      />
    </span>
  );
};
PrivateToggle.propTypes = {
  isPrivate: PropTypes.bool.isRequired,
  setPrivate: PropTypes.func.isRequired,
};

const Embed = ({domain}) => (
  <div className="glitch-embed-wrap">
    <iframe title="embed" src={`https://glitch.com/embed/#!/embed/${domain}?path=README.md&previewSize=100`}></iframe>
  </div>
);
Embed.propTypes = {
  domain: PropTypes.string.isRequired,
};

const ReadmeError = (error) => (
  (error && error.response && error.response.status === 404)
    ? <React.Fragment>This project would be even better with a <code>README.md</code></React.Fragment>
    : <React.Fragment>We couldn't load the readme. Try refreshing?</React.Fragment>
);
const ReadmeLoader = ({api, domain}) => (
  <DataLoader get={() => api.get(`projects/${domain}/readme`)} renderError={ReadmeError}>
    {({data}) => <Expander height={200}><Markdown>{data}</Markdown></Expander>}
  </DataLoader>
);
ReadmeLoader.propTypes = {
  api: PropTypes.any.isRequired,
  domain: PropTypes.string.isRequired,
};

export const InterestingPackageJsonThings = ({data}) => {
  console.log(data["dependencies"]);
  const dependenciesArray = Object.keys(data.dependencies);
  
  const popularDependenciesWebsites = {
    "react": "reactjs.org",
    "babel-core": "babeljs.io",
    "sqlite3": "www.sqlite.org",
    "sass": "sass-lang.com",
    "less": "lesscss.org",
    "typescript": "www.typescriptlang.org",
    "webpack": "webpack.js.org",
    "eslint": "eslint.org",
    "moment": "momentjs.com",
    "lodash": "lodash.com",
    "underscore": "underscorejs.org",
    "jquery": "jquery.com",
    "aws-sdk": "aws.amazon.com/tools",
    "passport": "www.passportjs.org",
    "mongodb": "www.mongodb.com",
    "express-handlebars": "handlebarsjs.com",
    "googleapis": "developers.google.com",
    "ghost": "ghost.org",
    "bluebird": "bluebirdjs.com",
    "async": "caolan.github.io/async",
    "express": "expressjs.com",
    
  };

  const popularDependencies = Object.keys(popularDependenciesWebsites);
  const popularMatches = dependenciesArray.filter(
    (dependency) => popularDependencies.includes(dependency)
  ).map((dependency) => {
    const hostUrl = popularDependenciesWebsites[dependency];
    const imgUrl = "https://favicon-fetcher.glitch.me/img/" + hostUrl;
    return {
      name: dependency,
      imgUrl,
    };
  });
       
  const licenseLogos = {
    "Apache License Version 2.0":"http://www.apache.org/img/asf_logo.png",
    "MIT": "https://opensource.org/files/osi_keyhole_300X300_90ppi_0.png",
    "GPL-3.0": "https://www.gnu.org/graphics/gplv3-127x51.png"
  };
  
  const currentProjectLicenseLogo = licenseLogos[data["license"]];
  
  const logoStyle = {
    width: '20px',
    float: 'left',
    padding: '0px 2px'
  };

  return (
    <React.Fragment>
      <ul style={{listStyleType:'none'}} className="logos">
        {popularMatches.map(({name, imgUrl}) => <li key={name}><img title={name} src={imgUrl} className="logo" style={logoStyle}/></li>)}
      </ul>
      <div>
        License: {data.license}
        <img alt="License Logo" src={currentProjectLicenseLogo} width="50px"/>
      </div>
    </React.Fragment>
  );
};

// https://api.glitch.com/projects/{projectid}/files/package.json
export const ProjectFileStats = ({api, domain}) => (
  <DataLoader get={() => api.get(`projects/${domain}/files/package.json`)} renderError={ReadmeError}>
    {({data}) => <InterestingPackageJsonThings data={data}/>}
  </DataLoader>
);

const ProjectPage = ({
  project: {
    description, domain, id, users, teams,
    ...project // 'private' can't be used as a variable name
  },
  api,
  isAuthorized,
  updateDomain,
  updateDescription,
  updatePrivate,
}) => (
  <main className="project-page">
    <section id="info">
      <InfoContainer>
        <ProjectInfoContainer style={{backgroundImage: `url('${getAvatarUrl(id)}')`}}>
          <section id="projectFileStatus">
            <ProjectFileStats api={api} domain={domain}></ProjectFileStats>
          </section>
          <h1>
            {(isAuthorized ? (
              <EditableField value={domain} placeholder="Name your project"
                update={domain => updateDomain(domain).then(() => syncPageToDomain(domain))}
                suffix={<PrivateToggle isPrivate={project.private} isMember={isAuthorized} setPrivate={updatePrivate}/>}
              />
            ) : <React.Fragment>{domain} {project.private && <PrivateBadge/>}</React.Fragment>)}
          </h1>
          <UsersList users={users} />
          <AuthDescription
            authorized={isAuthorized} description={description}
            update={updateDescription} placeholder="Tell us about your app"
          />
          <p className="buttons">
            <ShowButton name={domain}/>
            <EditButton name={domain} isMember={isAuthorized}/>
          </p>
        </ProjectInfoContainer>
      </InfoContainer>
    </section>
    <section id="embed">
      <Embed domain={domain}/>
      <div className="buttons buttons-right">
        <RemixButton className="button-small"
          name={domain} isMember={isAuthorized}
          onClick={() => trackRemix(id, domain)}
        />
      </div>
    </section>

    <section id="readme">
      <ReadmeLoader api={api} domain={domain}/>
    </section>
    <section id="related">
      <RelatedProjects ignoreProjectId={id} {...{api, teams, users}}/>
    </section>
    <section id="feedback" className="buttons buttons-right">
      <ReportButton name={domain} id={id} className="button-small button-tertiary"/>
    </section>
  </main>
);
ProjectPage.propTypes = {
  api: PropTypes.any.isRequired,
  isAuthorized: PropTypes.bool.isRequired,
  project: PropTypes.object.isRequired,
};

async function getProject(api, domain) {
  const {data} = await api.get(`projects/${domain}`);
  return data ? Project(data).update(data).asProps() : null;
}

const ProjectPageLoader = ({domain, api, ...props}) => (
  <DataLoader get={() => getProject(api, domain)} renderError={() => <NotFound name={domain}/>}>
    {project => project ? (
      <ProjectEditor api={api} initialProject={project}>
        {(project, funcs, userIsMember) => (
          <React.Fragment>
            <Helmet>
              <title>{project.domain}</title>
            </Helmet>
            <ProjectPage api={api} project={project} {...funcs} isAuthorized={userIsMember} {...props}/>
          </React.Fragment>
        )}
      </ProjectEditor>
    ) : <NotFound name={domain}/>}
  </DataLoader>
);
ProjectPageLoader.propTypes = {
  domain: PropTypes.string.isRequired,
};

const ProjectPageContainer = ({api, name}) => (
  <Layout api={api}>
    <ProjectPageLoader api={api} domain={name}/>
  </Layout>
);

export default ProjectPageContainer;