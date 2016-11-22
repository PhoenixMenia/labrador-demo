/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-11-19
 * @author Li <li@maichong.it>
 */

import wx, { Component, PropTypes } from 'labrador-immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'labrador-redux';
import Todo from '../../components/todo/todo';
import * as todoActions from '../../redux/todos';
import sleep from '../../utils/sleep';

const { array } = PropTypes;

class Index extends Component {
  static propTypes = {
    todos: array
  };

  state = {
    titleInput: '',
    count: 0,
    finished: 0
  };

  children() {
    let todos = this.props.todos || [];
    let unfinished = [];
    let finished = [];
    if (todos.length) {
      unfinished = todos.filter((todo) => !todo.finished);
      finished = todos.asMutable().filter((todo) => todo.finished).sort((a, b) => (a.finishedAt < b.finishedAt ? 1 : -1)).slice(0, 3);
    }
    return {
      todos: unfinished.map((todo) => ({
        component: Todo,
        key: todo.id,
        props: {
          ...todo,
          onRemove: this.handleRemove,
          onRestore: this.handleRestore,
          onFinish: this.handleFinish
        }
      })),
      finished: finished.map((todo) => ({
        component: Todo,
        key: todo.id,
        props: {
          ...todo,
          onRemove: this.handleRemove,
          onRestore: this.handleRestore,
          onFinish: this.handleFinish
        }
      }))
    };
  }

  onUpdate(props) {
    let nextState = {
      count: props.todos.length,
      finished: 0
    };
    props.todos.forEach((todo) => {
      if (todo.finished) {
        nextState.finished++;
      }
    });
    this.setState(nextState);
  }

  async onPullDownRefresh() {
    await sleep(1000);
    wx.showToast({ title: '刷新成功' });
    wx.stopPullDownRefresh();
  }

  handleCreate() {
    let title = this.state.titleInput;
    if (!title) {
      wx.showToast({ title: '请输入任务' });
      return;
    }
    this.props.createTodo({ title });
    this.setState({ titleInput: '' });
  }

  handleInput(e) {
    this.setState({ titleInput: e.detail.value });
  }

  handleRemove = (id) => {
    this.props.removeTodo(id);
  };

  handleFinish = (id) => {
    this.props.finishTodo(id);
  };

  handleRestore = (id) => {
    this.props.restoreTodo(id);
  };

  handleShowFinished() {
    wx.navigateTo({ url: 'finished' });
  }

  handleShowUI() {
    wx.navigateTo({ url: '/pages/ui/index' });
  }
}

export default connect(
  ({ todos }) => ({ todos }),
  (dispatch) => bindActionCreators({
    createTodo: todoActions.create,
    removeTodo: todoActions.remove,
    finishTodo: todoActions.finish,
    restoreTodo: todoActions.restore,
  }, dispatch)
)(Index);
