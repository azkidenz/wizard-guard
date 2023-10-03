package it.wizardguard;

import android.app.PendingIntent;
import android.app.assist.AssistStructure;
import android.content.Intent;
import android.os.CancellationSignal;
import android.service.autofill.AutofillService;
import android.service.autofill.Dataset;
import android.service.autofill.FillCallback;
import android.service.autofill.FillContext;
import android.service.autofill.FillRequest;
import android.service.autofill.FillResponse;
import android.service.autofill.SaveCallback;
import android.service.autofill.SaveRequest;
import android.view.autofill.AutofillId;
import android.view.autofill.AutofillValue;
import android.widget.RemoteViews;

import java.util.ArrayList;
import java.util.List;

public class WizardGuardAutofillService extends AutofillService {

    private static class ResultStructure {
        AutofillId autofillId;
        ResultStructure(AutofillId autofillId) {
            this.autofillId = autofillId;
        }
    }

    @Override
    public void onFillRequest(FillRequest request, CancellationSignal cancellationSignal, FillCallback callback) {
        List<FillContext> context = request.getFillContexts();
        AssistStructure structure = context.get(context.size() - 1).getStructure();
        ResultStructure autofillStructure = parseStructure(structure);

        if (autofillStructure.autofillId != null) {
            FillResponse.Builder responseBuilder = new FillResponse.Builder();
            RemoteViews presentation = new RemoteViews(getPackageName(), R.layout.wizardguard_autofill_view);
            Intent intent = new Intent(this, MainActivity.class);
            PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_IMMUTABLE);
            presentation.setOnClickPendingIntent(R.id.button, pendingIntent);

            AutofillValue autofillValue = AutofillValue.forText("");
            Dataset dataset = new Dataset.Builder()
                    .setValue(autofillStructure.autofillId, autofillValue, presentation)
                    .build();
            responseBuilder.addDataset(dataset);

            FillResponse fillResponse = responseBuilder.build();
            callback.onSuccess(fillResponse);
        } else {
            callback.onSuccess(null);
        }
    }

    private ResultStructure parseStructure(AssistStructure structure) {
        ResultStructure resultStructure = new ResultStructure(null);
        List<AssistStructure.WindowNode> windowNodes = new ArrayList<>();
        for (int i = 0; i < structure.getWindowNodeCount(); i++) {
            windowNodes.add(structure.getWindowNodeAt(i));
        }
        for (AssistStructure.WindowNode windowNode : windowNodes) {
            AssistStructure.ViewNode rootViewNode = windowNode.getRootViewNode();
            if (rootViewNode != null) {
                if(traverseNode(rootViewNode, resultStructure)) {
                    return resultStructure;
                }
            }
        }
        return resultStructure;
    }
    private boolean traverseNode(AssistStructure.ViewNode viewNode, ResultStructure resultStructure) {
        resultStructure.autofillId = viewNode.getAutofillId();
        if (viewNode.getAutofillHints() != null) {
            return true;
        }
        int childCount = viewNode.getChildCount();
        for (int i = 0; i < childCount; i++) {
            if(traverseNode(viewNode.getChildAt(i), resultStructure)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public void onSaveRequest(SaveRequest request, SaveCallback callback) {}
}
