import mitt from 'mitt';

type Events = {
  newTask: { projectId: string };
};

const emitter = mitt<Events>();

export default emitter;
