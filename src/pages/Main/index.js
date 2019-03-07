import React, { Component } from 'react';
import moment from 'moment';
import logo from '../../assets/logo.png';

import { Container, Form } from './styles';

import CompareList from '../../components/CompareList';

import api from '../../services/api';

export default class Main extends Component {
  state = {
    loading: false,
    repositoryError: false,
    repositoryInput: '',
    repositories: [],
  };

  componentWillMount = () => {
    if (localStorage.getItem('repository') !== null) {
      this.setState({
        repositories: JSON.parse(localStorage.getItem('repository')),
      });
    }
  };

  updateRepository = async (id) => {
    const repositoryForUpdate = this.state.repositories.find(r => r.id === id);

    try {
      const { data } = await api.get(`/repos/${repositoryForUpdate.full_name}`);

      data.lastCommit = moment(data.pushed_at).fromNow();

      this.setState({
        repositoryInput: '',
        repositories: this.state.repositories.map(r => (r.id === data.id ? data : r)),
        repositoryError: false,
      });

      await localStorage.removeItem('repository');
      const repoString = JSON.stringify(this.state.repositories);
      await localStorage.setItem('repository', repoString);
    } catch (err) {
      console.log(err);
    }
  };

  removeRepository = async (id) => {
    const newRepositories = this.state.repositories.filter(r => r.id !== id);
    this.setState({
      repositories: newRepositories,
    });
    await localStorage.removeItem('repository');
    const repoString = JSON.stringify(this.state.repositories);
    await localStorage.setItem('repository', repoString);
  };

  handleAddRepository = async (e) => {
    e.preventDefault();

    this.setState({ loading: true });

    try {
      const { data: repository } = await api.get(`/repos/${this.state.repositoryInput}`);

      repository.lastCommit = moment(repository.pushed_at).fromNow();

      this.setState({
        repositoryInput: '',
        repositories: [...this.state.repositories, repository],
        repositoryError: false,
      });

      const repoString = JSON.stringify(this.state.repositories);
      localStorage.setItem('repository', repoString);
    } catch (err) {
      this.setState({ repositoryError: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    return (
      <Container>
        <img src={logo} alt="Github compare" />
        <Form withError={this.state.repositoryError} onSubmit={this.handleAddRepository}>
          <input
            type="text"
            placeholder="usuario/repositorio"
            value={this.state.repositoryInput}
            onChange={e => this.setState({ repositoryInput: e.target.value })}
          />
          <button type="submit">
            {this.state.loading ? <i className="fa fa-spinner fa-pulse" /> : 'OK'}
          </button>
        </Form>
        <CompareList
          repositories={this.state.repositories}
          removeRepository={this.removeRepository}
          updateRepository={this.updateRepository}
        />
      </Container>
    );
  }
}
