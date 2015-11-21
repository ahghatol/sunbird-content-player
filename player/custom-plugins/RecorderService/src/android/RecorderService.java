import android.util.Log;
import org.apache.cordova.CordovaActivity;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CordovaInterface;

import java.io.FileNotFoundException;
import java.io.IOException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;
import java.util.HashMap;

import com.sensibol.ekstep.speechengine.sdk.InvalidOrCorruptMedatada;
import com.sensibol.ekstep.speechengine.sdk.InvalidStateException;
import com.sensibol.ekstep.speechengine.sdk.LineIndexOutOfBoundException;
import com.sensibol.ekstep.speechengine.sdk.OnAudioRecordingCompleteListener;
import com.sensibol.ekstep.speechengine.sdk.SEException;
import com.sensibol.ekstep.speechengine.sdk.SpeechEngine;
import com.sensibol.ekstep.speechengine.sdk.SpeechEngineFactory;

public class RecorderService extends CordovaPlugin {

	public static final String TAG = "Genie Service Plugin";
    private static final String WORK_DIR_PATH = "/storage/emulated/0/Genie/SdkWorkDir";
    private SpeechEngine speechEngine;

	public RecorderService() {
		System.out.println("Recorder Service Constructor..........");
    }

    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        // Context context = this.cordova.getActivity().getApplicationContext(); 
        speechEngine = SpeechEngineFactory.INSTANCE.getSpeechEngine();
        try {
            speechEngine.init(this.cordova.getActivity().getApplicationContext(), WORK_DIR_PATH);
        } catch (SEException e) {
            e.printStackTrace();
        } catch (InvalidStateException e) {
            e.printStackTrace();
        }
        super.initialize(cordova, webView);
    }

    public void onDestroy() {
        super.onDestroy();
    }

    public boolean execute(final String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        CordovaActivity activity = (CordovaActivity) this.cordova.getActivity();
        System.out.println("Recorder Service action: " + action);
        if(action.equals("initLesson")) {
            if (args.length() != 1) {
                callbackContext.error(getErrorJSONObject("INVALID_ACTION", null));
                return false;
            }
            String lessonMetadataFile = args.getString(0);
            initLesson(lessonMetadataFile, callbackContext);
        } else if(action.equals("startRecording")) {
            if (args.length() != 1) {
                callbackContext.error(getErrorJSONObject("INVALID_ACTION", null));
                return false;
            }
            String recordingFile = args.getString(0);
            startRecording(recordingFile, callbackContext);
        } else if(action.equals("stopRecording")) {
            stopRecording(callbackContext);
        } else if(action.equals("processRecording")) {
            if (args.length() != 2) {
                callbackContext.error(getErrorJSONObject("INVALID_ACTION", null));
                return false;
            }
            String recordingFile = args.getString(0);
            int lineIndex = args.getInt(1);
            processRecording(recordingFile, lineIndex, callbackContext);
        }
        return true;
    }

    private void initLesson(String lessonMetadataFile, CallbackContext callbackContext) {
        if (null != lessonMetadataFile) {
            try {
                speechEngine.initLesson(lessonMetadataFile);
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            } catch (InvalidStateException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            } catch (InvalidOrCorruptMedatada e) {
                e.printStackTrace();
            }
            Map<String, String> map = new HashMap<String, String>();
            map.put("status", "success");
            callbackContext.success(new JSONObject(map));
        }
    }

    private void startRecording(String recordingFile, CallbackContext callbackContext) {
        try {
            speechEngine.startRecording(recordingFile);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (SEException e) {
            e.printStackTrace();
        } catch (InvalidStateException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        System.out.println("Recording Stopped.");
        Map<String, String> map = new HashMap<String, String>();
        map.put("status", "success");
        callbackContext.success(new JSONObject(map));
    }

    private void stopRecording(final CallbackContext callbackContext) {
        try {
            speechEngine.stopRecording(new OnAudioRecordingCompleteListener() {
                @Override
                public void onAudioRecordingComplete() {
                    System.out.println("Recording Stopped.");
                    Map<String, String> map = new HashMap<String, String>();
                    map.put("status", "success");
                    callbackContext.success(new JSONObject(map));
                }
            });
        } catch (SEException e) {
            e.printStackTrace();
        } catch (InvalidStateException e) {
            e.printStackTrace();
        }
    }

    private void processRecording(String recordingFile, int lineIndex, CallbackContext callbackContext) {
        JSONObject result = null;
        try {
            System.out.println("*** Processing file:" + recordingFile + " :: Line:" + lineIndex);
            result = speechEngine.processRecording(recordingFile, lineIndex);
            System.out.println("ProcessRecording result= " + result.toString());
            Map<String, Object> map = new HashMap<String, Object>();
            map.put("status", "success");
            map.put("result", result);
            callbackContext.success(new JSONObject(map));
        } catch (SEException e) {
            e.printStackTrace();
        } catch (InvalidStateException e) {
            e.printStackTrace();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (LineIndexOutOfBoundException e) {
            e.printStackTrace();
        }
    }

    private JSONObject getErrorJSONObject(String errorCode, String errorParam) {
        Map<String, Object> error = new HashMap<String, Object>();
        error.put("status", "error");
        JSONObject obj = new JSONObject(error);
        try {
            if (null != errorCode)
                error.put("errorCode", errorCode);
            if (null != errorParam)
                error.put("errorParam", errorParam);
            obj = new JSONObject(error);
        } catch(Exception e) {
        }
        return obj;
    }

}