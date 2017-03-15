import { Observable } from 'rxjs'
import { createEventHandler } from 'recompose'
import firebase from '../firebase'

export default ref => (prop$) => {
  const {
    handler: onChange,
    stream: change$
  } = createEventHandler()

  // firebase node value as observable stream
  const dbValue$ = Observable.create((observer) => {
    firebase.database()
      .ref(ref)
      .on('value', snap => observer.next(snap.val())
    )
  })

  // merge database values observables with form field changes
  const value$ = change$.merge(dbValue$);

  // write values to firebase on a debounced timeline
  value$.debounceTime(300).subscribe(
    value => firebase.database()
      .ref(ref)
      .set(value)
  )

  return prop$.combineLatest(
    value$,
    (props, value) =>
      ({
        ...props,
        onChange,
        value
      })
  )
}
