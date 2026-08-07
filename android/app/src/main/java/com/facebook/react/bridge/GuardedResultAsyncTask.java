package com.facebook.react.bridge;

import android.os.AsyncTask;
import java.util.concurrent.Executor;

public abstract class GuardedResultAsyncTask<Result> extends AsyncTask<Void, Void, Result> {
  private final JSExceptionHandler exceptionHandler;

  protected GuardedResultAsyncTask(JSExceptionHandler exceptionHandler) {
    this.exceptionHandler = exceptionHandler;
  }

  protected GuardedResultAsyncTask(ReactContext reactContext) {
    this(reactContext.getExceptionHandler());
  }

  @Override
  protected final Result doInBackground(Void... params) {
    try {
      return doInBackgroundGuarded();
    } catch (RuntimeException e) {
      if (exceptionHandler != null) {
        exceptionHandler.handleException(e);
      } else {
        throw e;
      }
      return null;
    }
  }

  protected abstract Result doInBackgroundGuarded();

  @Override
  protected void onPostExecute(Result result) {
    try {
      onPostExecuteGuarded(result);
    } catch (RuntimeException e) {
      if (exceptionHandler != null) {
        exceptionHandler.handleException(e);
      } else {
        throw e;
      }
    }
  }

  protected void onPostExecuteGuarded(Result result) {}

  public static final Executor THREAD_POOL_EXECUTOR = AsyncTask.THREAD_POOL_EXECUTOR;
}
