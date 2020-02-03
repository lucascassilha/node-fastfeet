import Bee from 'bee-queue';
import redisConfig from '../config/redis';
import CancellationMail from '../app/jobs/CancellationMail';
import DeliveryMail from '../app/jobs/DeliveryMail';

const jobs = [CancellationMail, DeliveryMail];

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('fail', this.handleFail).process(handle);
    });
  }

  handleFail(error, job) {
    console.log(`Queue ${job.queue.name} FAILED!  ${error}`);
  }
}

export default new Queue();
