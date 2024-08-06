import useStrategy from './useStrategy';
import Loading from '../Loading';
import Message from '../Chat/Message';
import useScreenshot from './useScreenshot';

const ExecuteStrategy = () => {
  const { isLoading, requestHash, llmResult, runStrategy } = useStrategy();
  const {screenshot} = useScreenshot();

  return (
    <div>
      {!isLoading && <button className='btn btn-primary' onClick={runStrategy}>Start</button>}
      {screenshot && <img src={screenshot} alt="screenshot" />}
      {isLoading && <Loading />}
      {requestHash && <p>Request Hash: {requestHash}</p>}
      {llmResult && <Message message={llmResult} />}
    </div>
  );
};

export default ExecuteStrategy;