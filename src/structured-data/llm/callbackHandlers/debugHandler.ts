import { BaseCallbackHandler } from 'langchain/callbacks';
import { DebugReport } from '../dto/debug.dto';

export class DebugCallbackHandler extends BaseCallbackHandler {
  name = 'DebugCallbackHandler';

  private _debugReport: DebugReport;
  private _chainCallCount = 0;
  private _llmCallCount = 0;

  get debugReport() {
    return this._debugReport;
  }
}
