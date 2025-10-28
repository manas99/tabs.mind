import { useEffect, useState, useCallback } from "react";
import { AiService, type ModelType } from "../../libs/ai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FullPageWrapper } from "../../components/layouts/full-page-wrapper";
import { Button } from "../../components/button";

type PerModelProgress = Partial<Record<ModelType, number>>;
type PerModelStatus = Partial<Record<ModelType, string>>;

export function InstallPage() {
    const [models, setModels] = useState<any[]>([]);
    const [progressByModel, setProgressByModel] = useState<PerModelProgress>(
        {},
    );
    const [statusByModel, setStatusByModel] = useState<PerModelStatus>({});

    const refresh = useCallback(async () => {
        const res = await AiService.Instance.checkModels();
        setModels(res);

        const nextProgress: PerModelProgress = {};
        const nextStatus: PerModelStatus = {};
        res.forEach((m) => {
            nextProgress[m.type as ModelType] = m.progress ?? 0;
            nextStatus[m.type as ModelType] = m.availability;
        });
        setProgressByModel(nextProgress);
        setStatusByModel(nextStatus);
    }, []);

    useEffect(() => {
        refresh();
        const onChanged = (changes: any, area: string) => {
            if (area !== "local" || !changes.models) return;
            const value = changes.models.newValue;
            if (!value) return;
            const list = Object.values(value) as any[];
            setModels(list);
            const nextProgress: PerModelProgress = {};
            const nextStatus: PerModelStatus = {};
            list.forEach((m) => {
                nextProgress[m.type as ModelType] = m.progress ?? 0;
                nextStatus[m.type as ModelType] = m.availability;
            });
            setProgressByModel(nextProgress);
            setStatusByModel(nextStatus);
        };
        chrome.storage.onChanged.addListener(onChanged);
        return () => chrome.storage.onChanged.removeListener(onChanged);
    }, [refresh]);

    async function handleDownload(type: ModelType) {
        setStatusByModel((s) => ({ ...s, [type]: "downloading" }));
        setProgressByModel((p) => ({ ...p, [type]: 0 }));

        const ok = await AiService.Instance.downloadModel(type, (pct) => {
            setProgressByModel((prev) => ({ ...prev, [type]: pct }));
        });

        if (ok) {
            await refresh();
            alert(`${type} model ready ✅`);
        } else {
            setStatusByModel((s) => ({ ...s, [type]: "downloadable" }));
        }
    }

    const allReady =
        models.length > 0 &&
        models.every((m) => m.availability === "available");

    return (
        <FullPageWrapper showHomeButton={allReady}>
            <div className="p-8 space-y-4 max-w-lg mx-auto text-neutral-200">
                <p className="text-sm text-neutral-400">
                    Chrome’s on-device AI models must be downloaded once to
                    enable summarization and search suggestions.
                </p>

                {models.map((m) => {
                    const type = m.type as ModelType;
                    const availability = statusByModel[type] ?? m.availability;
                    const pct = progressByModel[type] ?? m.progress ?? 0;
                    const isDownloading = availability === "downloading";

                    return (
                        <div
                            key={type}
                            className="flex items-center justify-between border border-neutral-800 rounded p-3"
                        >
                            <div>
                                <div className="font-medium capitalize">
                                    {m.name} Model
                                </div>
                                <div className="text-xs text-neutral-400">
                                    {availability}
                                </div>
                            </div>

                            {availability === "available" ? (
                                <FontAwesomeIcon
                                    icon={faCircleCheck}
                                    className="text-green-400"
                                />
                            ) : isDownloading ? (
                                <div className="flex items-center gap-2 w-36">
                                    <div className="h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                </div>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={() => handleDownload(type)}
                                >
                                    Download
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>
        </FullPageWrapper>
    );
}
