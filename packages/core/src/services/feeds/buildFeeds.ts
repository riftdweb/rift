import { wait } from '../../shared/wait'
// import { updateActivityFeed } from '../activity'
// import { updateTopFeed } from '../top'
import { minutesToMilliseconds } from 'date-fns'

const SCHEDULE_INTERVAL = minutesToMilliseconds(5)

// TODO: move to rx
export async function scheduleFeedAggregator() {
  await Promise.all([
    // updateTopFeed({ priority: 3 }),
    // updateActivityFeed({
    //   priority: 3,
    // }),
  ])

  await wait(SCHEDULE_INTERVAL)
  scheduleFeedAggregator()
  return
}
