import React from 'react';
import PropTypes from 'prop-types';
import {sampleSize} from 'lodash';

import ProjectModel from '../models/project';

import Link from './includes/link.jsx';
import {ProjectsUL} from './projects-list.jsx';

const Category = ({category}) => {
  const ulProps = {
    projects: category.projects||[],
    categoryColor: category.color,
  };
  return (
    <article className="projects" style={{backgroundColor: category.backgroundColor}}>
      <header className="category">
        <Link className="category-name" to={category.url}>
          <h2>{category.name} <span className="arrow">→</span></h2>
        </Link>
        <span className="category-image-container">
          <Link className="category-image" to={category.url}>
            <img  height="80px" width="120px" src={category.avatarUrl} alt={category.name} />
          </Link>
        </span>
        <p className="category-description">{category.description}</p>
      </header>
      <ProjectsUL {...ulProps}/>
    </article>
  );
};

Category.propTypes = {
  category: PropTypes.shape({
    avatarUrl: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
};

class CategoryLoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
    };
  }
  
  async loadCategories() {
    // The API gives us a json blob with all of the categories, but only
    // the 'projects' field on 3 of them.  If the field is present,
    // then it's an array of projects.
    const {data} = await this.props.api.get('categories/random?numCategories=3&projectsPerCategory=3');
    const categoriesWithProjects = data.filter(category => !!category.projects);
    const sampledCategories = sampleSize(categoriesWithProjects, 3);
    const categories = sampledCategories.map(({projects, ...category}) => {
      const sampledProjects = sampleSize(projects, 3);
      return {
        projects: sampledProjects.map(project => ProjectModel(project).update(project).asProps()),
        ...category,
      };
    });
    this.setState({categories});
  }
  
  componentDidMount() {
    this.loadCategories();
  }
  
  render() {
    return this.state.categories.map((category) => (
      <Category key={category.id} category={category}/>
    ));
  }
}

CategoryLoader.propTypes = {
  api: PropTypes.any.isRequired,
};

export default CategoryLoader;